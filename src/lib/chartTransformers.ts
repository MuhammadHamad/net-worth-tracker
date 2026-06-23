import type { Transaction, NetWorthSnapshot, TimeRange, Income, Expense } from '@/types';
import { format, parseISO, subMonths, startOfMonth, isSameMonth, isAfter, subDays, subYears } from 'date-fns';

export interface MoneyFlowPoint { month: string; income: number; expense: number; }
export interface NetWorthPoint { date: string; label: string; netWorth: number; }

export interface NetWorthTrend {
  delta: number;
  pct: number | null;
  hasBaseline: boolean;
  /** Baseline came from before the window, so the change is "since you started". */
  sinceStart: boolean;
}

/**
 * Change in net worth versus a baseline ~`days` ago. Falls back to the earliest
 * snapshot ("since you started") when there isn't enough history for the window.
 */
export function getNetWorthTrend(snapshots: NetWorthSnapshot[], current: number, days = 7): NetWorthTrend {
  const none: NetWorthTrend = { delta: 0, pct: null, hasBaseline: false, sinceStart: false };
  if (snapshots.length === 0) return none;

  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const cutoff = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const onOrBeforeCutoff = sorted.filter((s) => s.date <= cutoff);
  let baseline = onOrBeforeCutoff.at(-1) ?? null;
  let sinceStart = false;

  if (!baseline) {
    // Not enough history for the window — compare against the first recorded day.
    const beforeToday = sorted.filter((s) => s.date < today);
    baseline = beforeToday[0] ?? null;
    sinceStart = baseline != null;
  }

  if (!baseline) return none;
  const delta = current - baseline.netWorth;
  const pct = baseline.netWorth !== 0 ? (delta / Math.abs(baseline.netWorth)) * 100 : null;
  return { delta, pct, hasBaseline: true, sinceStart };
}

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
