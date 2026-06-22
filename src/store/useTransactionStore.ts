import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';

/** A deleted record's id → deletion time (ISO). Used to propagate deletes to the cloud. */
export type Tombstones = Record<string, string>;

interface TransactionStore {
  transactions: Transaction[];
  tombstones: Tombstones;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  settleLoan: (id: string) => void;
}

const now = () => new Date().toISOString();
const stamp = (t: Transaction): Transaction => ({ ...t, updatedAt: now() });

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      tombstones: {},
      addTransaction: (t) => set((s) => ({ transactions: [stamp(t), ...s.transactions] })),
      updateTransaction: (t) => set((s) => ({ transactions: s.transactions.map((x) => (x.id === t.id ? stamp(t) : x)) })),
      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter((x) => x.id !== id),
        tombstones: { ...s.tombstones, [id]: now() },
      })),
      settleLoan: (id) => set((s) => ({
        transactions: s.transactions.map((x) =>
          x.id === id && (x.type === 'borrowed' || x.type === 'lent') ? { ...x, isSettled: true, updatedAt: now() } : x
        ),
      })),
    }),
    { name: 'nw_transactions' }
  )
);
