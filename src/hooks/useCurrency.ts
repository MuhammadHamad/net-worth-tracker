import { useCallback } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { formatCurrency } from '@/lib/formatters';

/** Reads the active profile currency and returns a bound formatter + the currency code. */
export function useCurrency() {
  const currency = useProfileStore((s) => s.profile.currency);
  const format = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);
  return { currency, format };
}
