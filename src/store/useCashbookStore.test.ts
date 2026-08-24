import { describe, it, expect, beforeEach } from 'vitest';
import { useCashbookStore } from './useCashbookStore';
import type { CashbookEntry } from '@/types/cashbook';

const sampleEntry: CashbookEntry = {
  id: 'cb-1',
  type: 'cash_out',
  amount: 1500,
  category: 'food',
  date: '2026-08-24',
  notes: 'Dinner',
  createdAt: '2026-08-24T12:00:00Z',
};

describe('useCashbookStore', () => {
  beforeEach(() => {
    useCashbookStore.getState().clearEntries();
  });

  it('adds a new entry', () => {
    useCashbookStore.getState().addEntry(sampleEntry);
    const { entries } = useCashbookStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('cb-1');
    expect(entries[0].updatedAt).toBeDefined();
  });

  it('updates an existing entry', () => {
    useCashbookStore.getState().addEntry(sampleEntry);
    useCashbookStore.getState().updateEntry({ ...sampleEntry, amount: 2000 });

    const { entries } = useCashbookStore.getState();
    expect(entries[0].amount).toBe(2000);
  });

  it('deletes an entry and records a tombstone', () => {
    useCashbookStore.getState().addEntry(sampleEntry);
    useCashbookStore.getState().deleteEntry('cb-1');

    const { entries, tombstones } = useCashbookStore.getState();
    expect(entries).toHaveLength(0);
    expect(tombstones['cb-1']).toBeDefined();
  });
});
