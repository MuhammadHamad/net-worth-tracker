import { describe, it, expect } from 'vitest';
import {
  getTotalIncome, getTotalExpenses, getCashBalance, getTotalAssetValue,
  getTotalBorrowed, getTotalLent, calculateNetWorth,
} from './calculations';
import type { Transaction } from '@/types';

// Builders keep the test data readable and type-safe.
const income = (amount: number): Transaction => ({ id: crypto.randomUUID(), type: 'income', amount, date: '2026-06-01', category: 'salary', createdAt: '2026-06-01T00:00:00Z' });
const expense = (amount: number): Transaction => ({ id: crypto.randomUUID(), type: 'expense', amount, date: '2026-06-01', category: 'food', createdAt: '2026-06-01T00:00:00Z' });
const asset = (estimatedValue: number): Transaction => ({ id: crypto.randomUUID(), type: 'asset', name: 'Thing', estimatedValue, category: 'savings', dateAdded: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' });
const lent = (amount: number, isSettled = false): Transaction => ({ id: crypto.randomUUID(), type: 'lent', personOrEntity: 'A', amount, date: '2026-06-01', isSettled, createdAt: '2026-06-01T00:00:00Z' });
const borrowed = (amount: number, isSettled = false): Transaction => ({ id: crypto.randomUUID(), type: 'borrowed', personOrEntity: 'B', amount, date: '2026-06-01', isSettled, createdAt: '2026-06-01T00:00:00Z' });

describe('individual aggregations', () => {
  it('sums income and expenses', () => {
    const txns = [income(100000), income(50000), expense(30000)];
    expect(getTotalIncome(txns)).toBe(150000);
    expect(getTotalExpenses(txns)).toBe(30000);
    expect(getCashBalance(txns)).toBe(120000);
  });

  it('sums asset estimated values', () => {
    expect(getTotalAssetValue([asset(250000), asset(50000)])).toBe(300000);
  });

  it('only counts UNSETTLED loans in lent/borrowed totals', () => {
    const txns = [lent(20000), lent(5000, true), borrowed(50000), borrowed(10000, true)];
    expect(getTotalLent(txns)).toBe(20000);
    expect(getTotalBorrowed(txns)).toBe(50000);
  });

  it('returns zero for empty input', () => {
    expect(getTotalIncome([])).toBe(0);
    expect(getCashBalance([])).toBe(0);
    expect(getTotalAssetValue([])).toBe(0);
  });
});

describe('calculateNetWorth', () => {
  it('applies the full formula: assets + lent(unsettled) + cash - borrowed(unsettled)', () => {
    const txns = [income(100000), expense(30000), asset(250000), lent(20000), borrowed(50000)];
    const m = calculateNetWorth(txns);
    // cash = 100000 - 30000 = 70000
    // netWorth = 250000 + 20000 + 70000 - 50000 = 290000
    expect(m.cashBalance).toBe(70000);
    expect(m.netWorth).toBe(290000);
    expect(m.totalAssets).toBe(250000);
    expect(m.totalDebt).toBe(50000);
    expect(m.totalLent).toBe(20000);
    expect(m.totalBorrowed).toBe(50000);
    expect(m.totalIncome).toBe(100000);
    expect(m.totalExpenses).toBe(30000);
  });

  it('excludes settled loans from net worth', () => {
    const active = calculateNetWorth([lent(20000), borrowed(50000)]);
    const settled = calculateNetWorth([lent(20000, true), borrowed(50000, true)]);
    expect(active.netWorth).toBe(20000 - 50000);
    expect(settled.netWorth).toBe(0); // both settled drop out
  });

  it('can go negative when debts exceed assets and cash', () => {
    const m = calculateNetWorth([borrowed(100000), income(10000)]);
    expect(m.netWorth).toBe(10000 - 100000);
  });

  it('returns all zeros for no transactions', () => {
    expect(calculateNetWorth([])).toEqual({
      netWorth: 0, totalAssets: 0, totalDebt: 0, cashBalance: 0,
      totalIncome: 0, totalExpenses: 0, totalLent: 0, totalBorrowed: 0,
    });
  });
});
