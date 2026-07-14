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

/**
 * Cash you actually hold right now:
 *   openingCash + income − expenses − moneyLentOut(unsettled) + moneyBorrowed(unsettled)
 *
 * Lending removes cash until it's repaid; borrowing adds cash you're holding until you
 * repay it. Settling a loan flips the unsettled term off, restoring cash by the same
 * amount — so lending, borrowing, and settling are all net-worth-neutral (see below).
 */
export function getCashBalance(transactions: Transaction[], openingCash = 0): number {
  return (
    openingCash +
    getTotalIncome(transactions) -
    getTotalExpenses(transactions) -
    getTotalLent(transactions) +
    getTotalBorrowed(transactions)
  );
}

export function calculateNetWorth(transactions: Transaction[], openingCash = 0): NetWorthMetrics {
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const totalAssets = getTotalAssetValue(transactions);
  const totalLent = getTotalLent(transactions);
  const totalBorrowed = getTotalBorrowed(transactions);
  const cashBalance = getCashBalance(transactions, openingCash);
  // netWorth = cash + assets + lent − borrowed. Substituting cash, the loan terms cancel,
  // so this equals openingCash + income − expenses + assets: loans never move net worth,
  // only earning, spending, and asset values do.
  return {
    netWorth: cashBalance + totalAssets + totalLent - totalBorrowed,
    totalAssets, totalDebt: totalBorrowed, cashBalance, totalIncome, totalExpenses, totalLent, totalBorrowed,
  };
}
