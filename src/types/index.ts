export type TransactionType = 'income' | 'expense' | 'asset' | 'borrowed' | 'lent';
export type IncomeCategory = 'salary' | 'business' | 'freelance' | 'gift' | 'other';
export type ExpenseCategory = 'food' | 'transport' | 'bills' | 'shopping' | 'health' | 'entertainment' | 'other';
export type AssetCategory = 'vehicle' | 'real_estate' | 'precious_metals' | 'investments' | 'savings' | 'other';
export type Currency = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';
export type TimeRange = 'week' | 'month' | 'year' | 'all';

// `updatedAt` (ISO) is the last-write-wins clock used by cloud sync. It is optional
// so data created before sync existed still loads; stores stamp it on every write.
export interface Income { id: string; type: 'income'; amount: number; date: string; category: IncomeCategory; notes?: string; createdAt: string; updatedAt?: string; }
export interface Expense { id: string; type: 'expense'; amount: number; date: string; category: ExpenseCategory; notes?: string; createdAt: string; updatedAt?: string; }
export interface Asset { id: string; type: 'asset'; name: string; estimatedValue: number; category: AssetCategory; dateAdded: string; isPaidFromCash?: boolean; notes?: string; createdAt: string; updatedAt?: string; }
export interface BorrowedLoan { id: string; type: 'borrowed'; personOrEntity: string; amount: number; date: string; dueDate?: string; notes?: string; isSettled: boolean; createdAt: string; updatedAt?: string; }
export interface LentLoan { id: string; type: 'lent'; personOrEntity: string; amount: number; date: string; expectedReturnDate?: string; notes?: string; isSettled: boolean; createdAt: string; updatedAt?: string; }
export type Transaction = Income | Expense | Asset | BorrowedLoan | LentLoan;

// `openingCash` is the user's cash/bank balance when they started tracking. Income,
// expenses, and loans move cash from there; net worth counts it once (never also as an asset).
export interface UserProfile { name: string; currency: Currency; openingCash?: number; updatedAt?: string; }
export interface NetWorthSnapshot { date: string; netWorth: number; totalAssets: number; totalDebt: number; cashBalance: number; updatedAt?: string; }
export interface NetWorthMetrics { netWorth: number; totalAssets: number; totalDebt: number; cashBalance: number; totalIncome: number; totalExpenses: number; totalLent: number; totalBorrowed: number; }

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'salary', label: 'Salary' }, { value: 'business', label: 'Business' },
  { value: 'freelance', label: 'Freelance' }, { value: 'gift', label: 'Gift' }, { value: 'other', label: 'Other' },
];
export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: 'Food & Dining' }, { value: 'transport', label: 'Transport' },
  { value: 'bills', label: 'Bills & Utilities' }, { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Health' }, { value: 'entertainment', label: 'Entertainment' }, { value: 'other', label: 'Other' },
];
export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'vehicle', label: 'Vehicle' }, { value: 'real_estate', label: 'Real Estate' },
  { value: 'precious_metals', label: 'Gold & Precious Metals' }, { value: 'investments', label: 'Investments' },
  { value: 'savings', label: 'Savings' }, { value: 'other', label: 'Other' },
];
export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'PKR', label: 'Pakistani Rupee (PKR)', symbol: '₨' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { value: 'AED', label: 'UAE Dirham (AED)', symbol: 'د.إ' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)', symbol: '﷼' },
];
