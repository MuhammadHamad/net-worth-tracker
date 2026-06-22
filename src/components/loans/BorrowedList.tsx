import { useMemo } from 'react';
import type { BorrowedLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoanRow } from './LoanRow';

export function BorrowedList() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();

  const borrowed = useMemo(
    () => transactions.filter((t): t is BorrowedLoan => t.type === 'borrowed'),
    [transactions]
  );
  const active = borrowed.filter((l) => !l.isSettled).sort((a, b) => b.date.localeCompare(a.date));
  const settled = borrowed.filter((l) => l.isSettled).sort((a, b) => b.date.localeCompare(a.date));
  const totalOwed = active.reduce((sum, l) => sum + l.amount, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="truncate">Money I Owe</CardTitle>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-destructive">{format(totalOwed)}</span>
      </CardHeader>
      <CardContent>
        {borrowed.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing borrowed. You’re debt-free here.</p>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="divide-y">
                {active.map((l) => <LoanRow key={l.id} loan={l} settleLabel="Mark Settled" />)}
              </div>
            )}
            {settled.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Settled</p>
                <div className="divide-y opacity-70">
                  {settled.map((l) => <LoanRow key={l.id} loan={l} settleLabel="Mark Settled" />)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
