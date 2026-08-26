import { useMemo, useState } from 'react';
import type { LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useT } from '@/i18n';
import { LoanRow } from './LoanRow';

export function LentList() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const lent = useMemo(
    () => transactions.filter((t): t is LentLoan => t.type === 'lent'),
    [transactions]
  );

  const active = useMemo(() => lent.filter((l) => !l.isSettled), [lent]);
  const totalOut = active.reduce((sum, l) => sum + l.amount, 0);

  const sorted = useMemo(() => {
    return [...lent].sort((a, b) => {
      if (a.isSettled !== b.isSettled) return a.isSettled ? 1 : -1;
      return b.date.localeCompare(a.date);
    });
  }, [lent]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const pageActive = paginated.filter((l) => !l.isSettled);
  const pageSettled = paginated.filter((l) => l.isSettled);

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
            {pageActive.length > 0 && (
              <div className="space-y-1">
                {pageActive.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markReceived')} />)}
              </div>
            )}
            {pageSettled.length > 0 && (
              <div>
                {pageActive.length > 0 && (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('loans.received')}</p>
                )}
                <div className="space-y-1 opacity-70">
                  {pageSettled.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markReceived')} />)}
                </div>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sorted.length}
              pageSize={pageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
