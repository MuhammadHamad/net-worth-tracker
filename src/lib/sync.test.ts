import { describe, it, expect, beforeEach } from 'vitest';
import type { Income, NetWorthSnapshot, UserProfile } from '@/types';
import type { RemoteRow } from './sync';

// Minimal localStorage shim so zustand's persist middleware works in the node env
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage() as unknown as Storage;

const { useTransactionStore } = await import('@/store/useTransactionStore');
const { useCashbookStore } = await import('@/store/useCashbookStore');
const { useSnapshotStore } = await import('@/store/useSnapshotStore');
const { useProfileStore } = await import('@/store/useProfileStore');
const { useUiStore } = await import('@/store/useUiStore');
const { applyRemote } = await import('./sync');

const income = (id: string, amount: number, updatedAt: string, notes?: string): Income => ({
  id, type: 'income', amount, date: '2026-06-01', category: 'salary', notes, createdAt: updatedAt, updatedAt,
});

const txRow = (id: string, updatedAt: string, opts: { deleted?: boolean; data?: unknown } = {}): RemoteRow => ({
  kind: 'transaction', item_id: id, deleted: opts.deleted ?? false,
  data: (opts.data ?? income(id, 100, updatedAt)) as Record<string, unknown>, updated_at: updatedAt,
});

const cbRow = (id: string, updatedAt: string, opts: { deleted?: boolean; data?: unknown } = {}): RemoteRow => ({
  kind: 'cashbook', item_id: id, deleted: opts.deleted ?? false,
  data: (opts.data ?? {
    id, type: 'cash_in', amount: 500, category: 'salary', date: '2026-06-01', createdAt: updatedAt, updatedAt,
  }) as Record<string, unknown>, updated_at: updatedAt,
});

const snap = (date: string, netWorth: number): NetWorthSnapshot => ({ date, netWorth, totalAssets: 0, totalDebt: 0, cashBalance: netWorth });
const snapRow = (date: string, updatedAt: string, netWorth: number): RemoteRow => ({
  kind: 'snapshot', item_id: date, deleted: false, data: snap(date, netWorth) as unknown as Record<string, unknown>, updated_at: updatedAt,
});

const profileRow = (updatedAt: string, name: string, openingCash?: number): RemoteRow => ({
  kind: 'profile', item_id: 'me', deleted: false,
  data: { name, currency: 'USD', openingCash, updatedAt } as UserProfile as unknown as Record<string, unknown>, updated_at: updatedAt,
});

describe('applyRemote (last-write-wins merge)', () => {
  beforeEach(() => {
    useTransactionStore.setState({ transactions: [], tombstones: {} });
    useCashbookStore.setState({ entries: [], tombstones: {} });
    useSnapshotStore.setState({ snapshots: [] });
    useProfileStore.setState({ profile: { name: '', currency: 'PKR' } });
    useUiStore.setState({ onboardingDone: false });
  });

  it('replaces a local transaction with a newer remote one', () => {
    useTransactionStore.setState({ transactions: [income('a', 100, '2026-06-01T00:00:00.000Z')] });
    applyRemote([txRow('a', '2026-06-02T00:00:00.000Z')]);
    const t = useTransactionStore.getState().transactions.find((x) => x.id === 'a');
    expect(t?.type === 'income' && t.amount).toBe(100);
  });

  it('tolerates null fields from PostgreSQL JSONB without dropping the transaction', () => {
    useTransactionStore.setState({ transactions: [] });
    applyRemote([
      txRow('t-with-nulls', '2026-06-02T00:00:00.000Z', {
        data: {
          id: 't-with-nulls',
          type: 'borrowed',
          personOrEntity: 'Bank',
          amount: 50000,
          date: '2026-06-01',
          dueDate: null,
          notes: null,
          repaidAmount: null,
          isSettled: false,
          createdAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-02T00:00:00.000Z',
        },
      }),
    ]);
    const list = useTransactionStore.getState().transactions;
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('t-with-nulls');
    expect(useUiStore.getState().onboardingDone).toBe(true);
  });

  it('synchronizes cashbook entries', () => {
    useCashbookStore.setState({ entries: [] });
    applyRemote([cbRow('cb-1', '2026-06-02T00:00:00.000Z')]);
    const entries = useCashbookStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('cb-1');
    expect(entries[0].amount).toBe(500);
  });

  it('keeps the local transaction when remote is the same age or older (LWW tie goes local)', () => {
    useTransactionStore.setState({ transactions: [income('a', 250, '2026-06-02T00:00:00.000Z')] });
    applyRemote([txRow('a', '2026-06-01T00:00:00.000Z')]); // older
    let t = useTransactionStore.getState().transactions.find((x) => x.id === 'a');
    expect(t?.type === 'income' && t.amount).toBe(250);

    applyRemote([txRow('a', '2026-06-02T00:00:00.000Z')]); // exact tie
    t = useTransactionStore.getState().transactions.find((x) => x.id === 'a');
    expect(t?.type === 'income' && t.amount).toBe(250);
  });

  it('removes a local row when a newer remote tombstone arrives, and clears the local tombstone slot', () => {
    useTransactionStore.setState({ transactions: [income('a', 100, '2026-06-01T00:00:00.000Z')], tombstones: {} });
    applyRemote([txRow('a', '2026-06-02T00:00:00.000Z', { deleted: true })]);
    const state = useTransactionStore.getState();
    expect(state.transactions.find((x) => x.id === 'a')).toBeUndefined();
    expect(state.tombstones['a']).toBeUndefined();
  });

  it('drops a truly malformed remote transaction row instead of trusting it', () => {
    useTransactionStore.setState({ transactions: [] });
    applyRemote([txRow('bad', '2026-06-01T00:00:00.000Z', { data: { id: 'bad', type: 'income', amount: 'NaN' } })]);
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  it('merges snapshots by date: newer remote replaces, older is ignored', () => {
    useSnapshotStore.setState({ snapshots: [{ ...snap('2026-06-01', 1000), updatedAt: '2026-06-01T12:00:00.000Z' }] });
    applyRemote([snapRow('2026-06-01', '2026-06-01T06:00:00.000Z', 999)]); // older — ignored
    expect(useSnapshotStore.getState().snapshots[0].netWorth).toBe(1000);

    applyRemote([snapRow('2026-06-01', '2026-06-02T00:00:00.000Z', 2000)]); // newer — applied
    expect(useSnapshotStore.getState().snapshots[0].netWorth).toBe(2000);
  });

  it('merges profile: newer remote wins and preserves openingCash', () => {
    useProfileStore.setState({ profile: { name: 'Local', currency: 'PKR' } }); // no updatedAt (EPOCH)
    applyRemote([profileRow('2026-01-01T00:00:00.000Z', 'Remote User', 75000)]);
    expect(useProfileStore.getState().profile.name).toBe('Remote User');
    expect(useProfileStore.getState().profile.openingCash).toBe(75000);
    expect(useUiStore.getState().onboardingDone).toBe(true);

    useProfileStore.setState({ profile: { name: 'Newer Local', currency: 'PKR', updatedAt: '2026-06-05T00:00:00.000Z' } });
    applyRemote([profileRow('2026-06-01T00:00:00.000Z', 'Older Remote')]); // older than local — ignored
    expect(useProfileStore.getState().profile.name).toBe('Newer Local');
  });
});
