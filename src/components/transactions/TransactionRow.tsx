import { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getTransactionView } from '@/lib/transactionView';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { EditTransactionDialog } from '@/components/forms/EditTransactionDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const v = getTransactionView(transaction);
  const date = 'date' in transaction ? transaction.date : transaction.dateAdded;

  const onDelete = () => {
    deleteTransaction(transaction.id);
    toast.success('Entry deleted');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', v.iconClass)}>
        <v.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{v.title}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(date)} · {v.typeLabel}</p>
      </div>
      <div className={cn('shrink-0 text-sm font-semibold', v.amountClass)}>
        {v.sign}{format(v.amount)}
      </div>
      <button
        className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Edit"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <EditTransactionDialog transaction={transaction} open={editOpen} onOpenChange={setEditOpen} />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{v.title}” ({format(v.amount)}). This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
