import { useIsMobile } from '@/hooks/useIsMobile';
import type { Transaction } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IncomeForm } from './IncomeForm';
import { ExpenseForm } from './ExpenseForm';
import { AssetForm } from './AssetForm';
import { BorrowedForm } from './BorrowedForm';
import { LentForm } from './LentForm';

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TITLES: Record<Transaction['type'], string> = {
  income: 'Edit Income',
  expense: 'Edit Expense',
  asset: 'Edit Asset',
  borrowed: 'Edit Borrowed Loan',
  lent: 'Edit Lent Loan',
};

function EditForm({ transaction, onSuccess }: { transaction: Transaction; onSuccess: () => void }) {
  switch (transaction.type) {
    case 'income': return <IncomeForm editing={transaction} onSuccess={onSuccess} />;
    case 'expense': return <ExpenseForm editing={transaction} onSuccess={onSuccess} />;
    case 'asset': return <AssetForm editing={transaction} onSuccess={onSuccess} />;
    case 'borrowed': return <BorrowedForm editing={transaction} onSuccess={onSuccess} />;
    case 'lent': return <LentForm editing={transaction} onSuccess={onSuccess} />;
  }
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const isMobile = useIsMobile();
  const close = () => onOpenChange(false);
  const title = TITLES[transaction.type];

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>Update the details and save.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="max-h-[70svh] px-4 pb-8">
            <EditForm transaction={transaction} onSuccess={close} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Update the details and save.</DialogDescription>
        </DialogHeader>
        <EditForm transaction={transaction} onSuccess={close} />
      </DialogContent>
    </Dialog>
  );
}
