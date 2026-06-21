import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IncomeForm } from './IncomeForm';
import { ExpenseForm } from './ExpenseForm';
import { AssetForm } from './AssetForm';
import { BorrowedForm } from './BorrowedForm';
import { LentForm } from './LentForm';

interface AddTransactionDialogProps {
  trigger: React.ReactNode;
  defaultTab?: 'income' | 'expense' | 'asset' | 'borrowed' | 'lent';
}

function FormTabs({ onSuccess, defaultTab = 'income' }: { onSuccess: () => void; defaultTab?: string }) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="expense">Expense</TabsTrigger>
        <TabsTrigger value="asset">Asset</TabsTrigger>
        <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
        <TabsTrigger value="lent">Lent</TabsTrigger>
      </TabsList>
      <div className="pt-4">
        <TabsContent value="income"><IncomeForm onSuccess={onSuccess} /></TabsContent>
        <TabsContent value="expense"><ExpenseForm onSuccess={onSuccess} /></TabsContent>
        <TabsContent value="asset"><AssetForm onSuccess={onSuccess} /></TabsContent>
        <TabsContent value="borrowed"><BorrowedForm onSuccess={onSuccess} /></TabsContent>
        <TabsContent value="lent"><LentForm onSuccess={onSuccess} /></TabsContent>
      </div>
    </Tabs>
  );
}

export function AddTransactionDialog({ trigger, defaultTab = 'income' }: AddTransactionDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Entry</DrawerTitle>
            <DrawerDescription>Log income, expense, asset, or a loan.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="max-h-[70svh] px-4 pb-8">
            <FormTabs onSuccess={close} defaultTab={defaultTab} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Entry</DialogTitle>
          <DialogDescription>Log income, expense, asset, or a loan.</DialogDescription>
        </DialogHeader>
        <FormTabs onSuccess={close} defaultTab={defaultTab} />
      </DialogContent>
    </Dialog>
  );
}
