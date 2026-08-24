import { useIsMobile } from '@/hooks/useIsMobile';
import type { Transaction } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useT, type TranslationKey } from '@/i18n';
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

const TITLE_KEYS: Record<Transaction['type'], TranslationKey> = {
  income: 'edit.income',
  expense: 'edit.expense',
  asset: 'edit.asset',
  borrowed: 'edit.borrowed',
  lent: 'edit.lent',
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
  const t = useT();
  const isMobile = useIsMobile();
  const close = () => onOpenChange(false);
  const title = t(TITLE_KEYS[transaction.type]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{t('edit.description')}</DrawerDescription>
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
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>
        <EditForm transaction={transaction} onSuccess={close} />
      </DialogContent>
    </Dialog>
  );
}
