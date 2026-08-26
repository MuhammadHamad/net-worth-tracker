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

  return (
    <>
      <div className="flex items-center gap-2 py-3 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-sm font-medium">{loan.personOrEntity}</p>
            {overdue && <Badge variant="destructive" className="shrink-0">{t('loans.overdue')}</Badge>}
            {loan.isSettled && <Badge variant="success" className="shrink-0">{t('common.settled')}</Badge>}
            {hasPartial && (
              <Badge variant="outline" className="shrink-0 text-xs text-primary border-primary/40 bg-primary/5">
                {t('loans.paidProgress', { paid: format(repaid), total: format(loan.amount) })}
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {formatDate(loan.date)}{dueDate ? ` · ${t('loans.due', { date: formatDate(dueDate) })}` : ''}
          </p>
          {loan.notes && <p className="truncate text-xs text-muted-foreground">{loan.notes}</p>}
        </div>

        <div className="shrink-0 text-right">
          <div className={cn('text-sm font-semibold', loan.isSettled && 'text-muted-foreground line-through')}>
            {format(loan.isSettled ? loan.amount : remaining)}
          </div>
          {hasPartial && (
            <div className="text-[10px] text-muted-foreground">
              Total: {format(loan.amount)}
            </div>
          )}
        </div>

        {!loan.isSettled && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 shrink-0 p-0 sm:w-auto sm:px-3 gap-1.5"
            aria-label={settleLabel}
            onClick={() => setRepayOpen(true)}
          >
            <Banknote className="h-4 w-4" />
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
