import { describe, it, expect, beforeEach } from 'vitest';
import type { Income, NetWorthSnapshot, UserProfile } from '@/types';
import type { RemoteRow } from './sync';

// Minimal localStorage shim so zustand's persist middleware works in the node env
// (same pattern as backup.test.ts / useTransactionStore.test.ts).
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage() as unknown as Storage;

const { useTransactionStore } = await import('@/store/useTransactionStore');
const { useSnapshotStore } = await import('@/store/useSnapshotStore');
const { useProfileStore } = await import('@/store/useProfileStore');
const { applyRemote } = await import('./sync');

const income = (id: string, amount: number, updatedAt: string): Income => ({
  id, type: 'income', amount, date: '2026-06-01', category: 'salary', createdAt: updatedAt, updatedAt,
});

const txRow = (id: string, updatedAt: string, opts: { deleted?: boolean; data?: unknown } = {}): RemoteRow => ({
  kind: 'transaction', item_id: id, deleted: opts.deleted ?? false,
  data: (opts.data ?? income(id, 100, updatedAt)) as Record<string, unknown>, updated_at: updatedAt,
});

const snap = (date: string, netWorth: number): NetWorthSnapshot => ({ date, netWorth, totalAssets: 0, totalDebt: 0, cashBalance: netWorth });
const snapRow = (date: string, updatedAt: string, netWorth: number): RemoteRow => ({
  kind: 'snapshot', item_id: date, deleted: false, data: snap(date, netWorth) as unknown as Record<string, unknown>, updated_at: updatedAt,
});

const profileRow = (updatedAt: string, name: string): RemoteRow => ({
  kind: 'profile', item_id: 'me', deleted: false,
  data: { name, currency: 'USD', updatedAt } as UserProfile as unknown as Record<string, unknown>, updated_at: updatedAt,
});

describe('applyRemote (last-write-wins merge)', () => {
  beforeEach(() => {
    useTransactionStore.setState({ transactions: [], tombstones: {} });
    useSnapshotStore.setState({ snapshots: [] });
    useProfileStore.setState({ profile: { name: '', currency: 'PKR' } });
  });

  it('replaces a local transaction with a newer remote one', () => {
    useTransactionStore.setState({ transactions: [income('a', 100, '2026-06-01T00:00:00.000Z')] });
    applyRemote([txRow('a', '2026-06-02T00:00:00.000Z')]);
    const t = useTransactionStore.getState().transactions.find((x) => x.id === 'a');
    expect(t?.type === 'income' && t.amount).toBe(100); // row's own data has amount 100 by default builder
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

  it('keeps a local tombstone (item stays deleted) when the remote live row is older', () => {
    useTransactionStore.setState({ transactions: [], tombstones: { a: '2026-06-05T00:00:00.000Z' } });
    applyRemote([txRow('a', '2026-06-01T00:00:00.000Z')]); // older than the tombstone
    const state = useTransactionStore.getState();
    expect(state.transactions.find((x) => x.id === 'a')).toBeUndefined();
    expect(state.tombstones['a']).toBe('2026-06-05T00:00:00.000Z');
  });

  it('resurrects a locally-deleted item when a newer remote live row arrives', () => {
    useTransactionStore.setState({ transactions: [], tombstones: { a: '2026-06-01T00:00:00.000Z' } });
    applyRemote([txRow('a', '2026-06-05T00:00:00.000Z')]); // newer than the tombstone
    const state = useTransactionStore.getState();
    expect(state.transactions.find((x) => x.id === 'a')).toBeTruthy();
    expect(state.tombstones['a']).toBeUndefined();
  });

  it('drops a malformed remote transaction row instead of trusting it', () => {
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

  it('merges profile: newer remote wins; a local profile with no updatedAt always loses', () => {
    useProfileStore.setState({ profile: { name: 'Local', currency: 'PKR' } }); // no updatedAt (EPOCH)
    applyRemote([profileRow('2026-01-01T00:00:00.000Z', 'Remote')]);
    expect(useProfileStore.getState().profile.name).toBe('Remote');

    useProfileStore.setState({ profile: { name: 'Newer Local', currency: 'PKR', updatedAt: '2026-06-05T00:00:00.000Z' } });
    applyRemote([profileRow('2026-06-01T00:00:00.000Z', 'Older Remote')]); // older than local — ignored
    expect(useProfileStore.getState().profile.name).toBe('Newer Local');
  });
});
