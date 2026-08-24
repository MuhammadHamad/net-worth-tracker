import { useMemo } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { calculateNetWorth } from '@/lib/calculations';

export function useNetWorthMetrics() {
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash ?? 0);
  return useMemo(() => calculateNetWorth(transactions, openingCash), [transactions, openingCash]);
}
