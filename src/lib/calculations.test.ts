import { describe, it, expect } from 'vitest';
import {
  getTotalIncome, getTotalExpenses, getCashBalance, getTotalAssetValue,
  getTotalBorrowed, getTotalLent, calculateNetWorth,
} from './calculations';
import type { Transaction } from '@/types';

// Builders keep the test data readable and type-safe.
const income = (amount: number): Transaction => ({ id: crypto.randomUUID(), type: 'income', amount, date: '2026-06-01', category: 'salary', createdAt: '2026-06-01T00:00:00Z' });
const expense = (amount: number): Transaction => ({ id: crypto.randomUUID(), type: 'expense', amount, date: '2026-06-01', category: 'food', createdAt: '2026-06-01T00:00:00Z' });
const asset = (estimatedValue: number, isPaidFromCash = false): Transaction => ({ id: crypto.randomUUID(), type: 'asset', name: 'Thing', estimatedValue, category: 'savings', dateAdded: '2026-06-01', isPaidFromCash, createdAt: '2026-06-01T00:00:00Z' });
const lent = (amount: number, isSettled = false): Transaction => ({ id: crypto.randomUUID(), type: 'lent', personOrEntity: 'A', amount, date: '2026-06-01', isSettled, createdAt: '2026-06-01T00:00:00Z' });
const borrowed = (amount: number, isSettled = false): Transaction => ({ id: crypto.randomUUID(), type: 'borrowed', personOrEntity: 'B', amount, date: '2026-06-01', isSettled, createdAt: '2026-06-01T00:00:00Z' });

describe('individual aggregations', () => {
  it('sums income and expenses', () => {
    const txns = [income(100000), income(50000), expense(30000)];
    expect(getTotalIncome(txns)).toBe(150000);
    expect(getTotalExpenses(txns)).toBe(30000);
  });

  it('sums asset estimated values', () => {
    expect(getTotalAssetValue([asset(250000), asset(50000)])).toBe(300000);
  });

  it('only counts UNSETTLED loans remaining balance in lent/borrowed totals', () => {
    const txns = [
      lent(20000),
      lent(5000, true),
      borrowed(50000),
      borrowed(10000, true),
      { ...lent(40000), repaidAmount: 15000 },
      { ...borrowed(30000), repaidAmount: 10000 },
    ];
    expect(getTotalLent(txns)).toBe(45000); // 20000 + (40000 - 15000)
    expect(getTotalBorrowed(txns)).toBe(70000); // 50000 + (30000 - 10000)
  });
});

describe('getCashBalance', () => {
  it('is openingCash + income − expenses', () => {
    expect(getCashBalance([income(100000), expense(30000)])).toBe(70000);
    expect(getCashBalance([income(100000), expense(30000)], 5000)).toBe(75000);
  });

  it('drops by money lent out and rises by money borrowed (while unsettled)', () => {
    // Lending removes cash you're holding; borrowing adds cash you now hold.
    expect(getCashBalance([lent(20000)], 100000)).toBe(80000);
    expect(getCashBalance([borrowed(50000)], 100000)).toBe(150000);
  });

  it('restores cash once a loan is settled', () => {
    expect(getCashBalance([lent(20000, true)], 100000)).toBe(100000);
    expect(getCashBalance([borrowed(50000, true)], 100000)).toBe(100000);
  });

  it('returns openingCash for empty input', () => {
    expect(getCashBalance([])).toBe(0);
    expect(getCashBalance([], 5000)).toBe(5000);
  });
});

describe('calculateNetWorth', () => {
  it('net worth = openingCash + income − expenses + assets (loans cancel out)', () => {
    const txns = [income(100000), expense(30000), asset(250000), lent(20000), borrowed(50000)];
    const m = calculateNetWorth(txns, 0);
    // cash = 0 + 100000 − 30000 − 20000(lent) + 50000(borrowed) = 100000
    // netWorth = cash 100000 + assets 250000 + lent 20000 − borrowed 50000 = 320000
    //          = openingCash 0 + income 100000 − expenses 30000 + assets 250000
    expect(m.cashBalance).toBe(100000);
    expect(m.netWorth).toBe(320000);
    expect(m.totalAssets).toBe(250000);
    expect(m.totalDebt).toBe(50000);
    expect(m.totalLent).toBe(20000);
    expect(m.totalBorrowed).toBe(50000);
  });

  it('income raises net worth and expenses lower it', () => {
    expect(calculateNetWorth([income(500)], 5000).netWorth).toBe(5500);
    expect(calculateNetWorth([income(500), expense(200)], 5000).netWorth).toBe(5300);
  });

  it('lending, borrowing, and settling never move net worth', () => {
    const baseline = calculateNetWorth([], 100000).netWorth;
    expect(baseline).toBe(100000);
    // Lend money out → cash falls, receivable rises: net worth unchanged.
    expect(calculateNetWorth([lent(20000)], 100000).netWorth).toBe(100000);
    // Friend repays (settled) → still unchanged (cash came back).
    expect(calculateNetWorth([lent(20000, true)], 100000).netWorth).toBe(100000);
    // Borrow → cash rises, debt rises: net worth unchanged.
    expect(calculateNetWorth([borrowed(50000)], 100000).netWorth).toBe(100000);
    // Repay (settled) → still unchanged (debt and cash both gone).
    expect(calculateNetWorth([borrowed(50000, true)], 100000).netWorth).toBe(100000);
  });

  it('deducts from cash balance when asset is paid from cash, preserving total net worth', () => {
    const txns = [income(100000), asset(40000, true)];
    const m = calculateNetWorth(txns);
    expect(m.cashBalance).toBe(60000);
    expect(m.totalAssets).toBe(40000);
    expect(m.netWorth).toBe(100000);
  });

  it('goes negative when you borrow and spend it', () => {
    const m = calculateNetWorth([borrowed(100000), expense(100000)]);
    expect(m.cashBalance).toBe(0);
    expect(m.netWorth).toBe(-100000);
  });

  it('returns all zeros for no transactions and no opening cash', () => {
    expect(calculateNetWorth([])).toEqual({
      netWorth: 0, totalAssets: 0, totalDebt: 0, cashBalance: 0,
      totalIncome: 0, totalExpenses: 0, totalLent: 0, totalBorrowed: 0,
    });
  });
});
