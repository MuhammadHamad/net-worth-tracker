import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NetWorthSnapshot } from '@/types';

interface SnapshotStore {
  snapshots: NetWorthSnapshot[];
  saveSnapshot: (s: NetWorthSnapshot) => void;
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set) => ({
      snapshots: [],
      // Upsert by `date`: replace an existing same-day snapshot, otherwise append.
      saveSnapshot: (snap) => set((state) => {
        const exists = state.snapshots.some((s) => s.date === snap.date);
        return {
          snapshots: exists
            ? state.snapshots.map((s) => (s.date === snap.date ? snap : s))
            : [...state.snapshots, snap],
        };
      }),
    }),
    { name: 'nw_snapshots' }
  )
);
