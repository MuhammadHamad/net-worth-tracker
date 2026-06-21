import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  settleLoan: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      updateTransaction: (t) => set((s) => ({ transactions: s.transactions.map((x) => (x.id === t.id ? t : x)) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      settleLoan: (id) => set((s) => ({
        transactions: s.transactions.map((x) =>
          x.id === id && (x.type === 'borrowed' || x.type === 'lent') ? { ...x, isSettled: true } : x
        ),
      })),
    }),
    { name: 'nw_transactions' }
  )
);
