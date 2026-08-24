import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/persistStorage';
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
        const stamped = { ...snap, updatedAt: new Date().toISOString() };
        const exists = state.snapshots.some((s) => s.date === stamped.date);
        return {
          snapshots: exists
            ? state.snapshots.map((s) => (s.date === stamped.date ? stamped : s))
            : [...state.snapshots, stamped],
        };
      }),
    }),
    { name: 'nw_snapshots', storage: createJSONStorage(() => safeStorage) }
  )
);
