import type { Transaction, NetWorthSnapshot, TimeRange, Income, Expense } from '@/types';
import { format, parseISO, subMonths, startOfMonth, isSameMonth, isAfter, subDays, subYears } from 'date-fns';

export interface MoneyFlowPoint { month: string; income: number; expense: number; }
export interface NetWorthPoint { date: string; label: string; netWorth: number; }

/** Income vs expense totals for each of the last `monthsBack` months (oldest → newest). */
export function getMoneyFlowData(transactions: Transaction[], monthsBack = 6): MoneyFlowPoint[] {
  const now = new Date();
  const incomes = transactions.filter((t): t is Income => t.type === 'income');
  const expenses = transactions.filter((t): t is Expense => t.type === 'expense');

  const buckets: MoneyFlowPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = startOfMonth(subMonths(now, i));
    const income = incomes
      .filter((t) => safeIsSameMonth(t.date, monthDate))
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = expenses
      .filter((t) => safeIsSameMonth(t.date, monthDate))
      .reduce((sum, t) => sum + t.amount, 0);
    buckets.push({ month: format(monthDate, 'MMM'), income, expense });
  }
  return buckets;
}

function safeIsSameMonth(dateStr: string, monthDate: Date): boolean {
  try { return isSameMonth(parseISO(dateStr), monthDate); } catch { return false; }
}

/** Snapshots filtered by range, sorted ascending by date, mapped for the area chart. */
export function getNetWorthHistoryData(snapshots: NetWorthSnapshot[], range: TimeRange): NetWorthPoint[] {
  const now = new Date();
  let cutoff: Date | null = null;
  if (range === 'week') cutoff = subDays(now, 7);
  else if (range === 'month') cutoff = subMonths(now, 1);
  else if (range === 'year') cutoff = subYears(now, 1);

  return [...snapshots]
    .filter((s) => {
      if (!cutoff) return true;
      try { return isAfter(parseISO(s.date), cutoff) || s.date === format(cutoff, 'yyyy-MM-dd'); } catch { return false; }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: s.date, label: safeShort(s.date), netWorth: s.netWorth }));
}

function safeShort(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d'); } catch { return dateStr; }
}
