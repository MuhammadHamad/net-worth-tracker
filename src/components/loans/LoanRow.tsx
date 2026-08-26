import { useState } from 'react';
import { Banknote } from 'lucide-react';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate, isOverdue } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RowActionsMenu } from '@/components/shared/RowActionsMenu';
import { RepayLoanDialog } from './RepayLoanDialog';

interface LoanRowProps {
  loan: BorrowedLoan | LentLoan;
  /** Label for the settle action, e.g. "Mark Settled" or "Mark Received". */
  settleLabel: string;
}

export function LoanRow({ loan, settleLabel }: LoanRowProps) {
  const t = useT();
  const { format } = useCurrency();
  const [repayOpen, setRepayOpen] = useState(false);

  const dueDate = loan.type === 'borrowed' ? loan.dueDate : loan.expectedReturnDate;
  const overdue = !loan.isSettled && dueDate ? isOverdue(dueDate) : false;

  const repaid = loan.repaidAmount || 0;
  const remaining = Math.max(0, loan.amount - repaid);
  const hasPartial = repaid > 0 && !loan.isSettled;
  const percentPaid = Math.min(100, Math.round((repaid / loan.amount) * 100));

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-3">
        {/* Left: Entity Name & Metadata */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{loan.personOrEntity}</p>
            {overdue && <Badge variant="destructive" className="shrink-0 text-[10px] py-0 px-1.5">{t('loans.overdue')}</Badge>}
            {loan.isSettled && <Badge variant="success" className="shrink-0 text-[10px] py-0 px-1.5">{t('common.settled')}</Badge>}
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {formatDate(loan.date)}
            {dueDate ? ` · ${t('loans.due', { date: formatDate(dueDate) })}` : ''}
            {hasPartial && (
              <>
                {' · '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Paid {format(repaid)} ({percentPaid}%)
                </span>
              </>
            )}
          </p>

          {hasPartial && (
            <div className="h-1 w-24 overflow-hidden rounded-full bg-muted/70 mt-1">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          )}

          {loan.notes && <p className="truncate text-xs text-muted-foreground">{loan.notes}</p>}
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <div className={cn('text-sm font-bold', loan.isSettled ? 'text-muted-foreground line-through' : 'text-foreground')}>
              {format(loan.isSettled ? loan.amount : remaining)}
            </div>
            {hasPartial && (
              <div className="text-[10px] text-muted-foreground">
                of {format(loan.amount)}
              </div>
            )}
          </div>

          {!loan.isSettled && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 shrink-0 border-primary/30 hover:border-primary text-primary hover:bg-primary/5"
              aria-label={settleLabel}
              onClick={() => setRepayOpen(true)}
            >
              <Banknote className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {loan.type === 'borrowed' ? t('loans.repay') : t('loans.receive')}
              </span>
            </Button>
          )}

          <RowActionsMenu
            transaction={loan}
            deleteName={loan.personOrEntity}
            deleteDetail={format(loan.amount)}
          />
        </div>
      </div>

      {repayOpen && (
        <RepayLoanDialog
          loan={loan}
          open={repayOpen}
          onOpenChange={setRepayOpen}
        />
      )}
    </>
  );
}
