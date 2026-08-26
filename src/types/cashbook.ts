export type CashbookEntryType = 'cash_in' | 'cash_out';

export type CashbookCategory =
  | 'food'
  | 'transport'
  | 'bills'
  | 'shopping'
  | 'groceries'
  | 'health'
  | 'entertainment'
  | 'weekly'
  | 'salary'
  | 'freelance'
  | 'business'
  | 'gift'
  | 'other';

export interface CashbookEntry {
  id: string;
  type: CashbookEntryType;
  amount: number;
  category: CashbookCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  isPostedToNetWorth?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CashbookPeriodFilter {
  periodType: PeriodType;
  year: number; // e.g. 2026
  month: number; // 1 - 12 (used when periodType === 'monthly')
  quarter: number; // 1 - 4 (used when periodType === 'quarterly')
  week?: number; // 1 - 52 (used when periodType === 'weekly')
}

export const CASHBOOK_CATEGORIES: { value: CashbookCategory; labelKey: string }[] = [
  { value: 'food', labelKey: 'cashbook.cat.food' },
  { value: 'transport', labelKey: 'cashbook.cat.transport' },
  { value: 'bills', labelKey: 'cashbook.cat.bills' },
  { value: 'shopping', labelKey: 'cashbook.cat.shopping' },
  { value: 'groceries', labelKey: 'cashbook.cat.groceries' },
  { value: 'health', labelKey: 'cashbook.cat.health' },
  { value: 'entertainment', labelKey: 'cashbook.cat.entertainment' },
  { value: 'weekly', labelKey: 'cashbook.cat.weekly' },
  { value: 'salary', labelKey: 'cashbook.cat.salary' },
  { value: 'freelance', labelKey: 'cashbook.cat.freelance' },
  { value: 'business', labelKey: 'cashbook.cat.business' },
  { value: 'gift', labelKey: 'cashbook.cat.gift' },
  { value: 'other', labelKey: 'cashbook.cat.other' },
];
