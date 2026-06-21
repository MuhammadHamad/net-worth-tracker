import { useMemo } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { calculateNetWorth } from '@/lib/calculations';

export function useNetWorthMetrics() {
  const transactions = useTransactionStore((s) => s.transactions);
  return useMemo(() => calculateNetWorth(transactions), [transactions]);
}
