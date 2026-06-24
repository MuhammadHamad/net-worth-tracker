import { describe, it, expect } from 'vitest';
import type { Income, NetWorthSnapshot } from '@/types';

// localStorage shim so the persisted stores work in the node test env.
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage() as unknown as Storage;

const { useTransactionStore } = await import('@/store/useTransactionStore');
const { useProfileStore } = await import('@/store/useProfileStore');
const { useSnapshotStore } = await import('@/store/useSnapshotStore');
const { buildBackup, parseBackup, restoreBackup } = await import('./backup');

const income: Income = { id: 'a', type: 'income', amount: 1000, date: '2026-06-01', category: 'salary', createdAt: '2026-06-01T00:00:00Z' };
const snap: NetWorthSnapshot = { date: '2026-06-01', netWorth: 1000, totalAssets: 0, totalDebt: 0, cashBalance: 1000 };

describe('backup', () => {
  it('round-trips export → parse → restore', () => {
    useTransactionStore.setState({ transactions: [income], tombstones: { z: '2026-06-02T00:00:00Z' } });
    useProfileStore.setState({ profile: { name: 'Hammad', currency: 'USD' } });
    useSnapshotStore.setState({ snapshots: [snap] });

    const text = JSON.stringify(buildBackup());

    // Wipe, then restore from the serialized backup.
    useTransactionStore.setState({ transactions: [], tombstones: {} });
    useProfileStore.setState({ profile: { name: '', currency: 'PKR' } });
    useSnapshotStore.setState({ snapshots: [] });

    restoreBackup(parseBackup(text));

    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(useTransactionStore.getState().tombstones.z).toBeTruthy();
    expect(useProfileStore.getState().profile.currency).toBe('USD');
    expect(useSnapshotStore.getState().snapshots).toHaveLength(1);
  });

  it('rejects invalid files', () => {
    expect(() => parseBackup('not json')).toThrow();
    expect(() => parseBackup('{"foo":1}')).toThrow();
    expect(() => parseBackup(JSON.stringify({ data: {} }))).toThrow();
  });
});
