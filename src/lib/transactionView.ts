import { ArrowDownCircle, ArrowUpCircle, Wallet, HandCoins, ArrowDownLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Transaction } from '@/types';
import type { TFn, TranslationKey } from '@/i18n';

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

/** Translation key for a category label, e.g. categoryKey('income', 'salary') → 'cat.income.salary'. */
export function categoryKey(type: 'income' | 'expense' | 'asset', value: string): TranslationKey {
  return `cat.${type}.${value}` as TranslationKey;
}

export function getTransactionView(tx: Transaction, t: TFn): TransactionView {
  switch (tx.type) {
    case 'income':
      return {
        icon: ArrowDownCircle, iconClass: 'text-[hsl(var(--success))] bg-[hsl(var(--success))]/10',
        title: t(categoryKey('income', tx.category)), subtitle: tx.notes || t('txsub.income'),
        amount: tx.amount, sign: '+', amountClass: 'text-[hsl(var(--success))]', typeLabel: t('type.income'),
      };
    case 'expense':
      return {
        icon: ArrowUpCircle, iconClass: 'text-destructive bg-destructive/10',
        title: t(categoryKey('expense', tx.category)), subtitle: tx.notes || t('txsub.expense'),
        amount: tx.amount, sign: '-', amountClass: 'text-destructive', typeLabel: t('type.expense'),
      };
    case 'asset':
      return {
        icon: Wallet, iconClass: 'text-primary bg-primary/10',
        title: tx.name, subtitle: t(categoryKey('asset', tx.category)),
        amount: tx.estimatedValue, sign: '+', amountClass: 'text-foreground', typeLabel: t('type.asset'),
      };
    case 'lent':
      return {
        icon: HandCoins, iconClass: 'text-amber-600 bg-amber-500/10',
        title: t('tx.lentTo', { name: tx.personOrEntity }), subtitle: tx.isSettled ? t('common.settled') : (tx.notes || t('txsub.moneyLent')),
        amount: tx.amount, sign: '+', amountClass: 'text-foreground', typeLabel: t('type.lent'),
      };
    case 'borrowed':
      return {
        icon: ArrowDownLeft, iconClass: 'text-destructive bg-destructive/10',
        title: t('tx.borrowedFrom', { name: tx.personOrEntity }), subtitle: tx.isSettled ? t('common.settled') : (tx.notes || t('txsub.moneyBorrowed')),
        amount: tx.amount, sign: '-', amountClass: 'text-destructive', typeLabel: t('type.borrowed'),
      };
  }
}
