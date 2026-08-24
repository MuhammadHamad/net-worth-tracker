import { describe, it, expect } from 'vitest';
import {
  filterCashbookEntries,
  calculateCashbookMetrics,
  getCategoryBreakdown,
} from './cashbookCalculations';
import type { CashbookEntry, CashbookPeriodFilter } from '@/types/cashbook';

const entry = (
  id: string,
  type: 'cash_in' | 'cash_out',
  amount: number,
  category: any,
  date: string
): CashbookEntry => ({
  id,
  type,
  amount,
  category,
  date,
  createdAt: new Date().toISOString(),
});

describe('filterCashbookEntries', () => {
  const entries = [
    entry('1', 'cash_out', 500, 'food', '2026-08-15'),
    entry('2', 'cash_in', 5000, 'salary', '2026-08-01'),
    entry('3', 'cash_out', 1200, 'bills', '2026-05-10'), // Q2
    entry('4', 'cash_out', 300, 'groceries', '2025-08-15'), // Different year
  ];

  it('filters monthly entries correctly', () => {
    const filter: CashbookPeriodFilter = { periodType: 'monthly', year: 2026, month: 8, quarter: 3 };
    const res = filterCashbookEntries(entries, filter);
    expect(res).toHaveLength(2);
    expect(res.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('filters quarterly entries correctly', () => {
    const filter: CashbookPeriodFilter = { periodType: 'quarterly', year: 2026, month: 8, quarter: 3 }; // Q3 is Jul-Sep
    const res = filterCashbookEntries(entries, filter);
    expect(res).toHaveLength(2);
    expect(res.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('filters yearly entries correctly', () => {
    const filter: CashbookPeriodFilter = { periodType: 'yearly', year: 2026, month: 8, quarter: 3 };
    const res = filterCashbookEntries(entries, filter);
    expect(res).toHaveLength(3);
    expect(res.map((e) => e.id)).toEqual(['1', '2', '3']);
  });
});

describe('calculateCashbookMetrics', () => {
  it('computes totalIn, totalOut, and netFlow accurately', () => {
    const entries = [
      entry('1', 'cash_in', 10000, 'salary', '2026-08-01'),
      entry('2', 'cash_out', 3000, 'food', '2026-08-05'),
      entry('3', 'cash_out', 2000, 'bills', '2026-08-10'),
    ];

    const metrics = calculateCashbookMetrics(entries);
    expect(metrics.totalIn).toBe(10000);
    expect(metrics.totalOut).toBe(5000);
    expect(metrics.netFlow).toBe(5000);
  });
});

describe('getCategoryBreakdown', () => {
  it('calculates category percentage breakdown for expenses', () => {
    const entries = [
      entry('1', 'cash_out', 6000, 'food', '2026-08-01'),
      entry('2', 'cash_out', 4000, 'bills', '2026-08-05'),
    ];

    const breakdown = getCategoryBreakdown(entries, 'cash_out');
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toEqual({ category: 'food', amount: 6000, percentage: 60 });
    expect(breakdown[1]).toEqual({ category: 'bills', amount: 4000, percentage: 40 });
  });
});
