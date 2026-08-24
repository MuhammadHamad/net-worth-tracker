import type { CashbookEntry, CashbookPeriodFilter, CashbookCategory } from '@/types/cashbook';

export interface CashbookMetrics {
  totalIn: number;
  totalOut: number;
  netFlow: number;
}

export function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function filterCashbookEntries(entries: CashbookEntry[], filter: CashbookPeriodFilter): CashbookEntry[] {
  return entries.filter((entry) => {
    if (!entry.date) return false;
    const [yearStr, monthStr] = entry.date.split('-');
    const entryYear = parseInt(yearStr, 10);
    const entryMonth = parseInt(monthStr, 10);

    if (entryYear !== filter.year) return false;

    if (filter.periodType === 'weekly') {
      const entryWeek = getWeekNumber(entry.date);
      const targetWeek = filter.week ?? getWeekNumber(new Date().toISOString().split('T')[0]);
      return entryWeek === targetWeek;
    }

    if (filter.periodType === 'monthly') {
      return entryMonth === filter.month;
    }

    if (filter.periodType === 'quarterly') {
      const entryQuarter = Math.ceil(entryMonth / 3);
      return entryQuarter === filter.quarter;
    }

    // yearly
    return true;
  });
}

export function calculateCashbookMetrics(entries: CashbookEntry[]): CashbookMetrics {
  const totalIn = entries
    .filter((e) => e.type === 'cash_in')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOut = entries
    .filter((e) => e.type === 'cash_out')
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    totalIn,
    totalOut,
    netFlow: totalIn - totalOut,
  };
}

export interface CategoryBreakdown {
  category: CashbookCategory;
  amount: number;
  percentage: number;
}

export function getCategoryBreakdown(entries: CashbookEntry[], type: 'cash_in' | 'cash_out'): CategoryBreakdown[] {
  const filtered = entries.filter((e) => e.type === type);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  if (total === 0) return [];

  const map = new Map<CashbookCategory, number>();
  for (const entry of filtered) {
    const prev = map.get(entry.category) || 0;
    map.set(entry.category, prev + entry.amount);
  }

  const result: CategoryBreakdown[] = [];
  map.forEach((amount, category) => {
    result.push({
      category,
      amount,
      percentage: (amount / total) * 100,
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}
