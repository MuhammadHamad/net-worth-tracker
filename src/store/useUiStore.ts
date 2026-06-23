import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExpenseCategory, IncomeCategory } from '@/types';

interface UiStore {
  /** User chose "continue without an account" — don't show the welcome screen again. */
  authSkipped: boolean;
  setAuthSkipped: (v: boolean) => void;
  /** Remembered quick-add categories so the most likely one is pre-selected. */
  lastExpenseCategory: ExpenseCategory;
  lastIncomeCategory: IncomeCategory;
  setLastExpenseCategory: (c: ExpenseCategory) => void;
  setLastIncomeCategory: (c: IncomeCategory) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      authSkipped: false,
      setAuthSkipped: (v) => set({ authSkipped: v }),
      lastExpenseCategory: 'food',
      lastIncomeCategory: 'salary',
      setLastExpenseCategory: (c) => set({ lastExpenseCategory: c }),
      setLastIncomeCategory: (c) => set({ lastIncomeCategory: c }),
    }),
    { name: 'nw_ui' }
  )
);
