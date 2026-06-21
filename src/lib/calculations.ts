import type { Transaction, Income, Expense, Asset, BorrowedLoan, LentLoan, NetWorthMetrics } from '@/types';

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter((t): t is Income => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t): t is Expense => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
}
export function getCashBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}
export function getTotalAssetValue(transactions: Transaction[]): number {
  return transactions.filter((t): t is Asset => t.type === 'asset').reduce((sum, t) => sum + t.estimatedValue, 0);
}
export function getTotalBorrowed(transactions: Transaction[]): number {
  return transactions.filter((t): t is BorrowedLoan => t.type === 'borrowed' && !t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalLent(transactions: Transaction[]): number {
  return transactions.filter((t): t is LentLoan => t.type === 'lent' && !t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
export function calculateNetWorth(transactions: Transaction[]): NetWorthMetrics {
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const cashBalance = totalIncome - totalExpenses;
  const totalAssets = getTotalAssetValue(transactions);
  const totalLent = getTotalLent(transactions);
  const totalBorrowed = getTotalBorrowed(transactions);
  return {
    netWorth: totalAssets + totalLent + cashBalance - totalBorrowed,
    totalAssets, totalDebt: totalBorrowed, cashBalance, totalIncome, totalExpenses, totalLent, totalBorrowed,
  };
}
