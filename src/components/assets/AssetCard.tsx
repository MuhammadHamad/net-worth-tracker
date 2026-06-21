import { useState } from 'react';
import { Trash2, Wallet, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Asset } from '@/types';
import { ASSET_CATEGORIES } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditTransactionDialog } from '@/components/forms/EditTransactionDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AssetCard({ asset }: { asset: Asset }) {
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const categoryLabel = ASSET_CATEGORIES.find((c) => c.value === asset.category)?.label ?? asset.category;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{asset.name}</p>
              <Badge variant="secondary" className="mt-1">{categoryLabel}</Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit asset"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <EditTransactionDialog transaction={asset} open={editOpen} onOpenChange={setEditOpen} />
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Delete asset">
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
                <AlertDialogDescription>
                  “{asset.name}” ({format(asset.estimatedValue)}) will be removed from your net worth.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => { deleteTransaction(asset.id); toast.success('Asset deleted'); setOpen(false); }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Estimated value</p>
          <p className="text-xl font-bold tracking-tight">{format(asset.estimatedValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Added {formatDate(asset.dateAdded)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
