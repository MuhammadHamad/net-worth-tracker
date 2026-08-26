import { useState } from 'react';
import { Banknote, Calendar, Clock, Pencil, StickyNote, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate, isOverdue } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditTransactionDialog } from '@/components/forms/EditTransactionDialog';
import { RepayLoanDialog } from './RepayLoanDialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LoanDetailDrawerProps {
  loan: BorrowedLoan | LentLoan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanDetailDrawer({ loan, open, onOpenChange }: LoanDetailDrawerProps) {
  const t = useT();
  const { format } = useCurrency();
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const [repayOpen, setRepayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isLent = loan.type === 'lent';
  const dueDate = isLent ? loan.expectedReturnDate : loan.dueDate;
  const overdue = !loan.isSettled && dueDate ? isOverdue(dueDate) : false;
  const repaid = loan.repaidAmount || 0;
  const remaining = Math.max(0, loan.amount - repaid);
  const hasPartial = repaid > 0;
  const percentPaid = loan.amount > 0 ? Math.min(100, Math.round((repaid / loan.amount) * 100)) : 0;

  const initial = loan.personOrEntity.charAt(0).toUpperCase();

  const handleDelete = () => {
    deleteTransaction(loan.id);
    toast.success(t('toast.entryDeleted'));
    setDeleteOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader className="pb-2">
            <div className="flex items-center gap-3">
              {/* Large avatar */}
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold',
                  loan.isSettled
                    ? 'bg-muted text-muted-foreground'
                    : isLent
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                )}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-left truncate">{loan.personOrEntity}</DrawerTitle>
                <DrawerDescription className="text-left">
                  {isLent ? t('loans.owedToMe') : t('loans.iOwe')}
                </DrawerDescription>
              </div>
              {loan.isSettled && <Badge variant="success" className="shrink-0">{t('common.settled')}</Badge>}
              {overdue && <Badge variant="destructive" className="shrink-0">{t('loans.overdue')}</Badge>}
            </div>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-5">
            {/* Amount hero section */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {loan.isSettled ? 'Total Amount' : 'Remaining'}
                </span>
                <span className={cn(
                  'text-2xl font-bold tracking-tight',
                  loan.isSettled
                    ? 'text-muted-foreground line-through'
                    : isLent
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}>
                  {format(loan.isSettled ? loan.amount : remaining)}
                </span>
              </div>

              {/* Progress bar for partial payments */}
              {hasPartial && (
                <div className="space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        loan.isSettled ? 'bg-emerald-500' : 'bg-primary'
                      )}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{format(repaid)}</span></span>
                    <span>Total: <span className="font-semibold text-foreground">{format(loan.amount)}</span></span>
                  </div>
                </div>
              )}

              {!hasPartial && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Principal</span>
                  <span className="font-semibold text-foreground">{format(loan.amount)}</span>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Date</p>
                  <p className="text-sm font-medium truncate">{formatDate(loan.date)}</p>
                </div>
              </div>
              {dueDate && (
                <div className={cn(
                  'flex items-center gap-2 rounded-lg border p-3',
                  overdue && 'border-destructive/40 bg-destructive/5'
                )}>
                  <Clock className={cn('h-4 w-4 shrink-0', overdue ? 'text-destructive' : 'text-muted-foreground')} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Due Date</p>
                    <p className={cn('text-sm font-medium truncate', overdue && 'text-destructive')}>{formatDate(dueDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {loan.notes && (
              <div className="flex items-start gap-2 rounded-lg border p-3">
                <StickyNote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Notes</p>
                  <p className="text-sm text-foreground">{loan.notes}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {!loan.isSettled && (
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    onOpenChange(false);
                    // Small delay so drawer closes before dialog opens
                    setTimeout(() => setRepayOpen(true), 200);
                  }}
                >
                  <Banknote className="h-4 w-4" />
                  {isLent ? t('loans.receive') : t('loans.repay')}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => setEditOpen(true), 200);
                }}
                aria-label={t('common.edit')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => setDeleteOpen(true), 200);
                }}
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Dialogs rendered outside drawer to avoid z-index conflicts */}
      {repayOpen && (
        <RepayLoanDialog loan={loan} open={repayOpen} onOpenChange={setRepayOpen} />
      )}
      <EditTransactionDialog transaction={loan} open={editOpen} onOpenChange={setEditOpen} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('del.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('del.desc', { name: loan.personOrEntity, detail: t('del.detail', { detail: format(loan.amount) }) })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
