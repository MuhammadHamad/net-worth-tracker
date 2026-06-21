import { useState } from 'react';
import { Trash2, CheckCircle2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate, isOverdue } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditTransactionDialog } from '@/components/forms/EditTransactionDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LoanRowProps {
  loan: BorrowedLoan | LentLoan;
  /** Label for the settle action, e.g. "Mark Settled" or "Mark Received". */
  settleLabel: string;
}

export function LoanRow({ loan, settleLabel }: LoanRowProps) {
  const settleLoan = useTransactionStore((s) => s.settleLoan);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const dueDate = loan.type === 'borrowed' ? loan.dueDate : loan.expectedReturnDate;
  const overdue = !loan.isSettled && dueDate ? isOverdue(dueDate) : false;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{loan.personOrEntity}</p>
          {overdue && <Badge variant="destructive" className="shrink-0">Overdue</Badge>}
          {loan.isSettled && <Badge variant="success" className="shrink-0">Settled</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(loan.date)}{dueDate ? ` · due ${formatDate(dueDate)}` : ''}
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
          className="shrink-0 gap-1"
          onClick={() => { settleLoan(loan.id); toast.success('Marked as settled'); }}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">{settleLabel}</span>
        </Button>
      )}

      <button
        className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Edit loan"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <EditTransactionDialog transaction={loan} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete loan">
            <Trash2 className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this loan?</AlertDialogTitle>
            <AlertDialogDescription>
              The {format(loan.amount)} record for “{loan.personOrEntity}” will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteTransaction(loan.id); toast.success('Loan deleted'); setOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
