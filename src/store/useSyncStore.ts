import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncStore {
  /** Server `updated_at` high-water mark from the last successful pull (ISO). */
  lastPullAt: string | null;
  /** Local clock of the last successful push (ISO). */
  lastPushAt: string | null;
  /** Wall-clock time of the last fully successful sync (ISO), for display. */
  lastSyncedAt: string | null;
  status: SyncStatus;
  error: string | null;
  setStatus: (status: SyncStatus, error?: string | null) => void;
  setCursors: (c: { lastPullAt?: string | null; lastPushAt?: string | null; lastSyncedAt?: string | null }) => void;
  /** Clear sync state (e.g. on sign-out) so a new account starts clean. */
  reset: () => void;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      lastPullAt: null,
      lastPushAt: null,
      lastSyncedAt: null,
      status: 'idle',
      error: null,
      setStatus: (status, error = null) => set({ status, error }),
      setCursors: (c) => set((s) => ({
        lastPullAt: c.lastPullAt !== undefined ? c.lastPullAt : s.lastPullAt,
        lastPushAt: c.lastPushAt !== undefined ? c.lastPushAt : s.lastPushAt,
        lastSyncedAt: c.lastSyncedAt !== undefined ? c.lastSyncedAt : s.lastSyncedAt,
      })),
      reset: () => set({ lastPullAt: null, lastPushAt: null, lastSyncedAt: null, status: 'idle', error: null }),
    }),
    { name: 'nw_sync' }
  )
);
