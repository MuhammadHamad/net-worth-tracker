import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/persistStorage';
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
  /** First-run setup completed (or skipped) — never show onboarding again. */
  onboardingDone: boolean;
  setOnboardingDone: (v: boolean) => void;
  /** Highest net-worth milestone already celebrated. -1 = not yet baselined. */
  milestoneReached: number;
  setMilestoneReached: (v: number) => void;
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
      onboardingDone: false,
      setOnboardingDone: (v) => set({ onboardingDone: v }),
      milestoneReached: -1,
      setMilestoneReached: (v) => set({ milestoneReached: v }),
    }),
    { name: 'nw_ui', storage: createJSONStorage(() => safeStorage) }
  )
);
