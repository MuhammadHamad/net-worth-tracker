import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/persistStorage';
import type { CashbookEntry } from '@/types/cashbook';

export type Tombstones = Record<string, string>;

interface CashbookStore {
  entries: CashbookEntry[];
  tombstones: Tombstones;
  addEntry: (entry: CashbookEntry) => void;
  updateEntry: (entry: CashbookEntry) => void;
  deleteEntry: (id: string) => void;
  clearEntries: () => void;
}

const now = () => new Date().toISOString();
const stamp = (e: CashbookEntry): CashbookEntry => ({ ...e, updatedAt: now() });

export const useCashbookStore = create<CashbookStore>()(
  persist(
    (set) => ({
      entries: [],
      tombstones: {},
      addEntry: (entry) => set((s) => ({ entries: [stamp(entry), ...s.entries] })),
      updateEntry: (entry) => set((s) => ({ entries: s.entries.map((x) => (x.id === entry.id ? stamp(entry) : x)) })),
      deleteEntry: (id) => set((s) => ({
        entries: s.entries.filter((x) => x.id !== id),
        tombstones: { ...s.tombstones, [id]: now() },
      })),
      clearEntries: () => set({ entries: [], tombstones: {} }),
    }),
    { name: 'nw_cashbook_entries', storage: createJSONStorage(() => safeStorage) }
  )
);
