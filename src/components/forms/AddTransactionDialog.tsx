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
import { QuickAddForm } from './QuickAddForm';
import { AssetForm } from './AssetForm';
import { BorrowedForm } from './BorrowedForm';
import { LentForm } from './LentForm';
import { useT } from '@/i18n';

interface AddTransactionDialogProps {
  trigger: React.ReactNode;
}

type Mode = 'quick' | 'detailed';

/** Detailed forms for the rarer entry types (asset / borrowed / lent). */
function DetailedForms({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const t = useT();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3 rtl:rotate-180" /> {t('add.backToQuick')}
      </button>
      <Tabs defaultValue="asset" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="grid w-full shrink-0 grid-cols-3">
          <TabsTrigger value="asset">{t('type.asset')}</TabsTrigger>
          <TabsTrigger value="borrowed">{t('type.borrowed')}</TabsTrigger>
          <TabsTrigger value="lent">{t('type.lent')}</TabsTrigger>
        </TabsList>
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pt-4">
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
  const t = useT();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('quick');
  const close = () => setOpen(false);

  // Always reopen on the fast path.
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setMode('quick');
  };

  const title = mode === 'quick' ? t('common.addEntry') : t('add.addAssetOrLoan');

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="flex max-h-[92svh] flex-col">
          <DrawerHeader className="shrink-0 pb-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{t('add.srDescription')}</DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <AddBody onSuccess={close} mode={mode} setMode={setMode} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[88vh] max-w-md flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{t('add.srDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <AddBody onSuccess={close} mode={mode} setMode={setMode} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
