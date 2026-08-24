import type { Transaction, Income, Expense, Asset, BorrowedLoan, LentLoan, NetWorthMetrics } from '@/types';

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter((t): t is Income => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t): t is Expense => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalAssetValue(transactions: Transaction[]): number {
  return transactions.filter((t): t is Asset => t.type === 'asset').reduce((sum, t) => sum + t.estimatedValue, 0);
}
// Unsettled loans only — these are live receivables / liabilities on the balance sheet.
export function getTotalBorrowed(transactions: Transaction[]): number {
  return transactions.filter((t): t is BorrowedLoan => t.type === 'borrowed' && !t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
export function getTotalLent(transactions: Transaction[]): number {
  return transactions.filter((t): t is LentLoan => t.type === 'lent' && !t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
// Settled loans represent a completed cash movement: lent money came back to you (cash in),
// borrowed money was paid back (cash out).
export function getSettledLentReceived(transactions: Transaction[]): number {
  return transactions.filter((t): t is LentLoan => t.type === 'lent' && t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
export function getSettledBorrowedRepaid(transactions: Transaction[]): number {
  return transactions.filter((t): t is BorrowedLoan => t.type === 'borrowed' && t.isSettled).reduce((sum, t) => sum + t.amount, 0);
}
export function getAssetCashDeductions(transactions: Transaction[]): number {
  return transactions
    .filter((t): t is Asset => t.type === 'asset' && Boolean(t.isPaidFromCash))
    .reduce((sum, t) => sum + t.estimatedValue, 0);
}
export function getCashBalance(transactions: Transaction[]): number {
  return (
    getTotalIncome(transactions) -
    getTotalExpenses(transactions) +
    getSettledLentReceived(transactions) -
    getSettledBorrowedRepaid(transactions) -
    getAssetCashDeductions(transactions)
  );
}
export function calculateNetWorth(transactions: Transaction[]): NetWorthMetrics {
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const totalAssets = getTotalAssetValue(transactions);
  const totalLent = getTotalLent(transactions);
  const totalBorrowed = getTotalBorrowed(transactions);
  // Cash includes settled-loan movements, so settling a loan is net-worth-neutral:
  // a lent loan's value shifts from "owed to me" into cash; a borrowed loan's repayment
  // removes the debt and the cash together.
  const cashBalance = getCashBalance(transactions);
  return {
    netWorth: totalAssets + totalLent + cashBalance - totalBorrowed,
    totalAssets, totalDebt: totalBorrowed, cashBalance, totalIncome, totalExpenses, totalLent, totalBorrowed,
  };
}
