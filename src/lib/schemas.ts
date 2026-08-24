import { z } from 'zod';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, ASSET_CATEGORIES, CURRENCIES,
  type Transaction, type NetWorthSnapshot, type UserProfile,
  type IncomeCategory, type ExpenseCategory, type AssetCategory, type Currency,
} from '@/types';
import { isValidAmount } from '@/lib/amount';

// Runtime validation for data that crosses a trust boundary — imported backup files and
// rows pulled from cloud sync. Both are otherwise cast straight to our types; a single
// malformed record (NaN/`"100"`/missing field) would poison every total. Invalid records
// are dropped by the callers rather than trusted.

const money = z.number().refine(isValidAmount, 'must be a real positive amount');
const finite = z.number().refine(Number.isFinite, 'must be a finite number');
const nonEmpty = z.string().min(1);

// Category/currency enums derived from the single source of truth in types/index.ts.
const incomeCategory = z.enum(INCOME_CATEGORIES.map((c) => c.value) as [IncomeCategory, ...IncomeCategory[]]);
const expenseCategory = z.enum(EXPENSE_CATEGORIES.map((c) => c.value) as [ExpenseCategory, ...ExpenseCategory[]]);
const assetCategory = z.enum(ASSET_CATEGORIES.map((c) => c.value) as [AssetCategory, ...AssetCategory[]]);
const currency = z.enum(CURRENCIES.map((c) => c.value) as [Currency, ...Currency[]]);

const incomeSchema = z.object({
  id: nonEmpty, type: z.literal('income'), amount: money, date: nonEmpty,
  category: incomeCategory, notes: z.string().optional(), createdAt: nonEmpty, updatedAt: z.string().optional(),
});
const expenseSchema = z.object({
  id: nonEmpty, type: z.literal('expense'), amount: money, date: nonEmpty,
  category: expenseCategory, notes: z.string().optional(), createdAt: nonEmpty, updatedAt: z.string().optional(),
});
const assetSchema = z.object({
  id: nonEmpty, type: z.literal('asset'), name: z.string(), estimatedValue: money,
  category: assetCategory, dateAdded: nonEmpty, notes: z.string().optional(), createdAt: nonEmpty, updatedAt: z.string().optional(),
});
const borrowedSchema = z.object({
  id: nonEmpty, type: z.literal('borrowed'), personOrEntity: z.string(), amount: money, date: nonEmpty,
  dueDate: z.string().optional(), notes: z.string().optional(), isSettled: z.boolean(), createdAt: nonEmpty, updatedAt: z.string().optional(),
});
const lentSchema = z.object({
  id: nonEmpty, type: z.literal('lent'), personOrEntity: z.string(), amount: money, date: nonEmpty,
  expectedReturnDate: z.string().optional(), notes: z.string().optional(), isSettled: z.boolean(), createdAt: nonEmpty, updatedAt: z.string().optional(),
});

const transactionSchema = z.discriminatedUnion('type', [
  incomeSchema, expenseSchema, assetSchema, borrowedSchema, lentSchema,
]);

const snapshotSchema = z.object({
  date: nonEmpty, netWorth: finite, totalAssets: finite, totalDebt: finite, cashBalance: finite, updatedAt: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string(), currency, openingCash: finite.optional(), updatedAt: z.string().optional(),
});

/** Validate one record; returns the typed value or `null` if it's malformed. */
export function validateTransaction(value: unknown): Transaction | null {
  const r = transactionSchema.safeParse(value);
  return r.success ? (r.data as Transaction) : null;
}
export function validateSnapshot(value: unknown): NetWorthSnapshot | null {
  const r = snapshotSchema.safeParse(value);
  return r.success ? r.data : null;
}
export function validateProfile(value: unknown): UserProfile | null {
  const r = profileSchema.safeParse(value);
  return r.success ? r.data : null;
}

/** Keep only the valid records from a list, returning them plus how many were dropped. */
export function filterValidTransactions(values: unknown[]): { valid: Transaction[]; skipped: number } {
  const valid: Transaction[] = [];
  let skipped = 0;
  for (const v of values) {
    const t = validateTransaction(v);
    if (t) valid.push(t);
    else skipped++;
  }
  return { valid, skipped };
}
