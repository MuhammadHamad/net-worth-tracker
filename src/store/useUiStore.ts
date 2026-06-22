import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  /** User chose "continue without an account" — don't show the welcome screen again. */
  authSkipped: boolean;
  setAuthSkipped: (v: boolean) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      authSkipped: false,
      setAuthSkipped: (v) => set({ authSkipped: v }),
    }),
    { name: 'nw_ui' }
  )
);
