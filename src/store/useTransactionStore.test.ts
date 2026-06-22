import { describe, it, expect, beforeEach } from 'vitest';
import type { Income } from '@/types';

// Minimal localStorage shim so zustand's persist middleware works in the node env.
class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage() as unknown as Storage;

const { useTransactionStore } = await import('./useTransactionStore');

const income = (id: string, amount: number): Income => ({
  id, type: 'income', amount, date: '2026-06-01', category: 'salary', createdAt: '2026-06-01T00:00:00Z',
});

describe('useTransactionStore sync metadata', () => {
  beforeEach(() => {
    useTransactionStore.setState({ transactions: [], tombstones: {} });
  });

  it('stamps updatedAt when adding', () => {
    useTransactionStore.getState().addTransaction(income('a', 100));
    const t = useTransactionStore.getState().transactions[0];
    expect(t.updatedAt).toBeTruthy();
  });

  it('refreshes updatedAt on update', async () => {
    const store = useTransactionStore.getState();
    store.addTransaction(income('a', 100));
    const first = useTransactionStore.getState().transactions[0].updatedAt!;
    await new Promise((r) => setTimeout(r, 5));
    useTransactionStore.getState().updateTransaction({ ...income('a', 250) });
    const after = useTransactionStore.getState().transactions[0];
    expect(after.type).toBe('income');
    if (after.type === 'income') expect(after.amount).toBe(250);
    expect(after.updatedAt! > first).toBe(true);
  });

  it('records a tombstone on delete and removes the row', () => {
    const store = useTransactionStore.getState();
    store.addTransaction(income('a', 100));
    store.deleteTransaction('a');
    const state = useTransactionStore.getState();
    expect(state.transactions.find((t) => t.id === 'a')).toBeUndefined();
    expect(state.tombstones['a']).toBeTruthy();
  });

  it('marks loans settled with a fresh updatedAt', () => {
    useTransactionStore.getState().addTransaction({
      id: 'l', type: 'lent', personOrEntity: 'A', amount: 50, date: '2026-06-01', isSettled: false, createdAt: '2026-06-01T00:00:00Z',
    });
    useTransactionStore.getState().settleLoan('l');
    const loan = useTransactionStore.getState().transactions[0];
    expect(loan.type === 'lent' && loan.isSettled).toBe(true);
    expect(loan.updatedAt).toBeTruthy();
  });
});
