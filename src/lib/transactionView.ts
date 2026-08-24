import { ArrowDownCircle, ArrowUpCircle, Wallet, HandCoins, ArrowDownLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Transaction } from '@/types';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, ASSET_CATEGORIES,
} from '@/types';

export interface TransactionView {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  subtitle: string;
  /** Display amount magnitude. */
  amount: number;
  /** '+' adds to net worth, '-' subtracts, '' neutral-ish. */
  sign: '+' | '-' | '';
  amountClass: string;
  typeLabel: string;
}

function labelFor(list: { value: string; label: string }[], value: string): string {
  return list.find((c) => c.value === value)?.label ?? value;
}

export function getTransactionView(t: Transaction): TransactionView {
  switch (t.type) {
    case 'income':
      return {
        icon: ArrowDownCircle, iconClass: 'text-[hsl(var(--success))] bg-[hsl(var(--success))]/10',
        title: labelFor(INCOME_CATEGORIES, t.category), subtitle: t.notes || 'Income',
        amount: t.amount, sign: '+', amountClass: 'text-[hsl(var(--success))]', typeLabel: 'Income',
      };
    case 'expense':
      return {
        icon: ArrowUpCircle, iconClass: 'text-destructive bg-destructive/10',
        title: labelFor(EXPENSE_CATEGORIES, t.category), subtitle: t.notes || 'Expense',
        amount: t.amount, sign: '-', amountClass: 'text-destructive', typeLabel: 'Expense',
      };
    case 'asset': {
      const catLabel = labelFor(ASSET_CATEGORIES, t.category);
      return {
        icon: Wallet, iconClass: 'text-primary bg-primary/10',
        title: t.name, subtitle: t.isPaidFromCash ? `${catLabel} · Paid from cash` : catLabel,
        amount: t.estimatedValue, sign: '+', amountClass: 'text-foreground', typeLabel: 'Asset',
      };
    }
    case 'lent':
      return {
        icon: HandCoins, iconClass: 'text-amber-600 bg-amber-500/10',
        title: `Lent to ${t.personOrEntity}`, subtitle: t.isSettled ? 'Settled' : (t.notes || 'Money lent'),
        amount: t.amount, sign: '+', amountClass: 'text-foreground', typeLabel: 'Lent',
      };
    case 'borrowed':
      return {
        icon: ArrowDownLeft, iconClass: 'text-destructive bg-destructive/10',
        title: `Borrowed from ${t.personOrEntity}`, subtitle: t.isSettled ? 'Settled' : (t.notes || 'Money borrowed'),
        amount: t.amount, sign: '-', amountClass: 'text-destructive', typeLabel: 'Borrowed',
      };
  }
}
