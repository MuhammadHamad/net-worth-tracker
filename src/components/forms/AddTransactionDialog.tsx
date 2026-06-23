import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuickAddForm } from './QuickAddForm';
import { AssetForm } from './AssetForm';
import { BorrowedForm } from './BorrowedForm';
import { LentForm } from './LentForm';

interface AddTransactionDialogProps {
  trigger: React.ReactNode;
}

type Mode = 'quick' | 'detailed';

/** Detailed forms for the rarer entry types (asset / borrowed / lent). */
function DetailedForms({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to quick add
      </button>
      <Tabs defaultValue="asset" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="asset">Asset</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
          <TabsTrigger value="lent">Lent</TabsTrigger>
        </TabsList>
        <div className="pt-4">
          <TabsContent value="asset"><AssetForm onSuccess={onSuccess} /></TabsContent>
          <TabsContent value="borrowed"><BorrowedForm onSuccess={onSuccess} /></TabsContent>
          <TabsContent value="lent"><LentForm onSuccess={onSuccess} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function AddBody({ onSuccess, mode, setMode }: { onSuccess: () => void; mode: Mode; setMode: (m: Mode) => void }) {
  return mode === 'quick'
    ? <QuickAddForm onSuccess={onSuccess} onMore={() => setMode('detailed')} />
    : <DetailedForms onSuccess={onSuccess} onBack={() => setMode('quick')} />;
}

export function AddTransactionDialog({ trigger }: AddTransactionDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('quick');
  const close = () => setOpen(false);

  // Always reopen on the fast path.
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setMode('quick');
  };

  const title = mode === 'quick' ? 'Add Entry' : 'Add Asset or Loan';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">Log income, expense, asset, or a loan.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="max-h-[80svh] px-4 pb-8 pt-3">
            <AddBody onSuccess={close} mode={mode} setMode={setMode} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">Log income, expense, asset, or a loan.</DialogDescription>
        </DialogHeader>
        <AddBody onSuccess={close} mode={mode} setMode={setMode} />
      </DialogContent>
    </Dialog>
  );
}
