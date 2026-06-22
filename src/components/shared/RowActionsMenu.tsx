import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { EditTransactionDialog } from '@/components/forms/EditTransactionDialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RowActionsMenuProps {
  transaction: Transaction;
  /** Name shown in the delete confirmation. */
  deleteName: string;
  /** Optional extra detail (e.g. formatted amount) shown in the confirmation. */
  deleteDetail?: string;
}

/** Compact "⋯" overflow menu (Edit / Delete) used by list rows and cards — keeps mobile rows uncluttered. */
export function RowActionsMenu({ transaction, deleteName, deleteDetail }: RowActionsMenuProps) {
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      {/* modal={false} so opening a dialog from a menu item doesn't fight the menu's focus lock. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-90"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[8rem]">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTransactionDialog transaction={transaction} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{deleteName}”{deleteDetail ? ` (${deleteDetail})` : ''}. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteTransaction(transaction.id); toast.success('Entry deleted'); setDeleteOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
