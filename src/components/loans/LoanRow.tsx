import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate, isOverdue } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RowActionsMenu } from '@/components/shared/RowActionsMenu';

interface LoanRowProps {
  loan: BorrowedLoan | LentLoan;
  /** Label for the settle action, e.g. "Mark Settled" or "Mark Received". */
  settleLabel: string;
}

export function LoanRow({ loan, settleLabel }: LoanRowProps) {
  const t = useT();
  const settleLoan = useTransactionStore((s) => s.settleLoan);
  const { format } = useCurrency();

  const dueDate = loan.type === 'borrowed' ? loan.dueDate : loan.expectedReturnDate;
  const overdue = !loan.isSettled && dueDate ? isOverdue(dueDate) : false;

  return (
    <div className="flex items-center gap-2 py-3 sm:gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{loan.personOrEntity}</p>
          {overdue && <Badge variant="destructive" className="shrink-0">{t('loans.overdue')}</Badge>}
          {loan.isSettled && <Badge variant="success" className="shrink-0">{t('common.settled')}</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(loan.date)}{dueDate ? ` · ${t('loans.due', { date: formatDate(dueDate) })}` : ''}
        </p>
        {loan.notes && <p className="truncate text-xs text-muted-foreground">{loan.notes}</p>}
      </div>

      <div className={cn('shrink-0 text-sm font-semibold', loan.isSettled && 'text-muted-foreground line-through')}>
        {format(loan.amount)}
      </div>

      {!loan.isSettled && (
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-9 shrink-0 p-0 sm:w-auto sm:px-3"
          aria-label={settleLabel}
          onClick={() => { settleLoan(loan.id); toast.success(t('loans.markedSettled')); }}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">{settleLabel}</span>
        </Button>
      )}

      <RowActionsMenu
        transaction={loan}
        deleteName={loan.personOrEntity}
        deleteDetail={format(loan.amount)}
      />
    </div>
  );
}
