import { useRef, useState } from 'react';
import { Archive, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { downloadBackup, parseBackup, restoreBackup, type ParsedBackup } from '@/lib/backup';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BackupCard() {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);

  const onExport = () => {
    downloadBackup();
    toast.success(t('toast.backupDownloaded'));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  const onConfirm = () => {
    if (!pending) return;
    restoreBackup(pending.backup);
    const skipped = pending.skipped;
    setPending(null);
    toast.success(t('toast.backupRestored'));
    if (skipped > 0) toast.warning(t('backup.skipped', { count: skipped }));
  };

  const count = pending?.backup.data.transactions.length ?? 0;
  const dateLabel = pending?.backup.exportedAt ? formatDate(pending.backup.exportedAt.slice(0, 10)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" /> {t('backup.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('backup.desc')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={onExport}>
            <Download className="h-4 w-4" /> {t('backup.export')}
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> {t('backup.import')}
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </CardContent>

      <AlertDialog open={!!pending} onOpenChange={(o) => { if (!o) setPending(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('backup.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('backup.confirmDesc', {
                count,
                entries: count === 1 ? t('backup.entryOne') : t('backup.entryMany'),
                from: dateLabel ? t('backup.fromDate', { date: dateLabel }) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{t('backup.restore')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
