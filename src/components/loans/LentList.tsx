import { useMemo } from 'react';
import type { LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/i18n';
import { LoanRow } from './LoanRow';

export function LentList() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();

  const lent = useMemo(
    () => transactions.filter((t): t is LentLoan => t.type === 'lent'),
    [transactions]
  );
  const active = lent.filter((l) => !l.isSettled).sort((a, b) => b.date.localeCompare(a.date));
  const settled = lent.filter((l) => l.isSettled).sort((a, b) => b.date.localeCompare(a.date));
  const totalOut = active.reduce((sum, l) => sum + l.amount, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="truncate">{t('loans.owedToMe')}</CardTitle>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-[hsl(var(--success))]">{format(totalOut)}</span>
      </CardHeader>
      <CardContent>
        {lent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('loans.lentEmpty')}</p>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="divide-y">
                {active.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markReceived')} />)}
              </div>
            )}
            {settled.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('loans.received')}</p>
                <div className="divide-y opacity-70">
                  {settled.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markReceived')} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
