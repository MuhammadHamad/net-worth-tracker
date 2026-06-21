import { describe, it, expect } from 'vitest';
import { getMoneyFlowData, getNetWorthHistoryData } from './chartTransformers';
import type { Transaction, NetWorthSnapshot } from '@/types';
import { format, subMonths } from 'date-fns';

const income = (amount: number, date: string): Transaction => ({ id: crypto.randomUUID(), type: 'income', amount, date, category: 'salary', createdAt: date });
const expense = (amount: number, date: string): Transaction => ({ id: crypto.randomUUID(), type: 'expense', amount, date, category: 'food', createdAt: date });

describe('getMoneyFlowData', () => {
  it('returns one bucket per month requested, oldest to newest', () => {
    const data = getMoneyFlowData([], 6);
    expect(data).toHaveLength(6);
    // Last bucket is the current month.
    expect(data.at(-1)!.month).toBe(format(new Date(), 'MMM'));
    expect(data.at(0)!.month).toBe(format(subMonths(new Date(), 5), 'MMM'));
  });

  it('buckets income and expense into the correct month', () => {
    const thisMonth = format(new Date(), 'yyyy-MM-15');
    const data = getMoneyFlowData([income(100000, thisMonth), expense(30000, thisMonth)], 6);
    const current = data.at(-1)!;
    expect(current.income).toBe(100000);
    expect(current.expense).toBe(30000);
  });

  it('ignores transactions older than the window', () => {
    const old = format(subMonths(new Date(), 10), 'yyyy-MM-15');
    const data = getMoneyFlowData([income(99999, old)], 6);
    expect(data.every((d) => d.income === 0)).toBe(true);
  });
});

describe('getNetWorthHistoryData', () => {
  const snap = (date: string, netWorth: number): NetWorthSnapshot => ({ date, netWorth, totalAssets: 0, totalDebt: 0, cashBalance: 0 });

  it('sorts ascending by date and maps net worth', () => {
    const out = getNetWorthHistoryData([snap('2026-06-03', 300), snap('2026-06-01', 100), snap('2026-06-02', 200)], 'all');
    expect(out.map((p) => p.netWorth)).toEqual([100, 200, 300]);
    expect(out.map((p) => p.date)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
  });

  it('"all" range keeps every snapshot', () => {
    const old = format(subMonths(new Date(), 24), 'yyyy-MM-dd');
    const out = getNetWorthHistoryData([snap(old, 1), snap('2026-06-01', 2)], 'all');
    expect(out).toHaveLength(2);
  });

  it('"week" range filters out snapshots older than ~7 days', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const longAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
    const out = getNetWorthHistoryData([snap(longAgo, 1), snap(today, 2)], 'week');
    expect(out.map((p) => p.netWorth)).toEqual([2]);
  });
});
