import { z } from 'zod';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, ASSET_CATEGORIES, CURRENCIES,
  type Transaction, type NetWorthSnapshot, type UserProfile,
  type IncomeCategory, type ExpenseCategory, type AssetCategory, type Currency,
} from '@/types';
import {
  CASHBOOK_CATEGORIES,
  type CashbookEntry,
  type CashbookCategory,
  type CashbookEntryType,
} from '@/types/cashbook';
import { isValidAmount } from '@/lib/amount';

// Runtime validation for data that crosses a trust boundary — imported backup files and
// rows pulled from cloud sync. Both are otherwise cast straight to our types; a single
// malformed record (NaN/missing required fields) must not poison totals, while harmless nulls
// from JSONB / databases must be cleanly tolerated.

const money = z.number().refine(isValidAmount, 'must be a real positive amount');
const finite = z.number().refine(Number.isFinite, 'must be a finite number');
const nonEmpty = z.string().min(1);

// Category/currency enums derived from single sources of truth.
const incomeCategory = z.enum(INCOME_CATEGORIES.map((c) => c.value) as [IncomeCategory, ...IncomeCategory[]]);
const expenseCategory = z.enum(EXPENSE_CATEGORIES.map((c) => c.value) as [ExpenseCategory, ...ExpenseCategory[]]);
const assetCategory = z.enum(ASSET_CATEGORIES.map((c) => c.value) as [AssetCategory, ...AssetCategory[]]);
const currency = z.enum(CURRENCIES.map((c) => c.value) as [Currency, ...Currency[]]);
const cashbookCategory = z.enum(CASHBOOK_CATEGORIES.map((c) => c.value) as [CashbookCategory, ...CashbookCategory[]]);
const cashbookType = z.enum(['cash_in', 'cash_out'] as [CashbookEntryType, ...CashbookEntryType[]]);

const nullishString = z.string().nullish().transform((v) => v || undefined);
const nullishNumber = z.number().nullish().transform((v) => (v !== null && v !== undefined ? v : undefined));
const nullishBoolean = z.boolean().nullish().transform((v) => (v !== null && v !== undefined ? v : undefined));

const incomeSchema = z.object({
  id: nonEmpty,
  type: z.literal('income'),
  amount: money,
  date: nonEmpty,
  category: incomeCategory,
  notes: nullishString,
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const expenseSchema = z.object({
  id: nonEmpty,
  type: z.literal('expense'),
  amount: money,
  date: nonEmpty,
  category: expenseCategory,
  notes: nullishString,
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const assetSchema = z.object({
  id: nonEmpty,
  type: z.literal('asset'),
  name: z.string(),
  estimatedValue: money,
  category: assetCategory,
  dateAdded: nonEmpty,
  isPaidFromCash: nullishBoolean,
  notes: nullishString,
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const borrowedSchema = z.object({
  id: nonEmpty,
  type: z.literal('borrowed'),
  personOrEntity: z.string(),
  amount: money,
  repaidAmount: nullishNumber,
  date: nonEmpty,
  dueDate: nullishString,
  notes: nullishString,
  isSettled: z.boolean().nullish().transform((v) => Boolean(v)),
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const lentSchema = z.object({
  id: nonEmpty,
  type: z.literal('lent'),
  personOrEntity: z.string(),
  amount: money,
  repaidAmount: nullishNumber,
  date: nonEmpty,
  expectedReturnDate: nullishString,
  notes: nullishString,
  isSettled: z.boolean().nullish().transform((v) => Boolean(v)),
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const cashbookEntrySchema = z.object({
  id: nonEmpty,
  type: cashbookType,
  amount: money,
  category: cashbookCategory,
  date: nonEmpty,
  notes: nullishString,
  isPostedToNetWorth: nullishBoolean,
  createdAt: z.string().nullish().transform((v) => v || new Date().toISOString()),
  updatedAt: nullishString,
}).passthrough();

const transactionSchema = z.discriminatedUnion('type', [
  incomeSchema, expenseSchema, assetSchema, borrowedSchema, lentSchema,
]);

const snapshotSchema = z.object({
  date: nonEmpty,
  netWorth: finite,
  totalAssets: finite,
  totalDebt: finite,
  cashBalance: finite,
  updatedAt: nullishString,
}).passthrough();

const profileSchema = z.object({
  name: z.string().nullish().transform((v) => v ?? ''),
  currency: currency.nullish().transform((v) => v ?? 'PKR'),
  openingCash: nullishNumber,
  updatedAt: nullishString,
}).passthrough();

/** Validate one transaction; returns the typed value or `null` if it's malformed. */
export function validateTransaction(value: unknown): Transaction | null {
  const r = transactionSchema.safeParse(value);
  return r.success ? (r.data as Transaction) : null;
}

/** Validate one cashbook entry; returns the typed value or `null` if it's malformed. */
export function validateCashbookEntry(value: unknown): CashbookEntry | null {
  const r = cashbookEntrySchema.safeParse(value);
  return r.success ? (r.data as CashbookEntry) : null;
}

export function validateSnapshot(value: unknown): NetWorthSnapshot | null {
  const r = snapshotSchema.safeParse(value);
  return r.success ? (r.data as NetWorthSnapshot) : null;
}

export function validateProfile(value: unknown): UserProfile | null {
  const r = profileSchema.safeParse(value);
  return r.success ? (r.data as UserProfile) : null;
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

/** Keep only the valid cashbook records from a list. */
export function filterValidCashbookEntries(values: unknown[]): { valid: CashbookEntry[]; skipped: number } {
  const valid: CashbookEntry[] = [];
  let skipped = 0;
  for (const v of values) {
    const e = validateCashbookEntry(v);
    if (e) valid.push(e);
    else skipped++;
  }
  return { valid, skipped };
}
