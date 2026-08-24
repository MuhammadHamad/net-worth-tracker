import { useMemo, useState } from 'react';
import type { BorrowedLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useT } from '@/i18n';
import { LoanRow } from './LoanRow';

export function BorrowedList() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const borrowed = useMemo(
    () => transactions.filter((t): t is BorrowedLoan => t.type === 'borrowed'),
    [transactions]
  );

  const active = useMemo(() => borrowed.filter((l) => !l.isSettled), [borrowed]);
  const totalOwed = active.reduce((sum, l) => sum + l.amount, 0);

  const sorted = useMemo(() => {
    return [...borrowed].sort((a, b) => {
      if (a.isSettled !== b.isSettled) return a.isSettled ? 1 : -1;
      return b.date.localeCompare(a.date);
    });
  }, [borrowed]);

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
        <CardTitle className="truncate">{t('loans.iOwe')}</CardTitle>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-destructive">{format(totalOwed)}</span>
      </CardHeader>
      <CardContent>
        {borrowed.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('loans.borrowedEmpty')}</p>
        ) : (
          <div className="space-y-4">
            {pageActive.length > 0 && (
              <div className="divide-y">
                {pageActive.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markSettled')} />)}
              </div>
            )}
            {pageSettled.length > 0 && (
              <div>
                {pageActive.length > 0 && (
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('common.settled')}</p>
                )}
                <div className="divide-y opacity-70">
                  {pageSettled.map((l) => <LoanRow key={l.id} loan={l} settleLabel={t('loans.markSettled')} />)}
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
