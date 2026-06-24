import { useRef, useState } from 'react';
import { Archive, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { downloadBackup, parseBackup, restoreBackup, type BackupFile } from '@/lib/backup';
import { formatDate } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BackupCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);

  const onExport = () => {
    downloadBackup();
    toast.success('Backup downloaded');
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
    restoreBackup(pending);
    setPending(null);
    toast.success('Backup restored');
  };

  const count = pending?.data.transactions.length ?? 0;
  const dateLabel = pending?.exportedAt ? formatDate(pending.exportedAt.slice(0, 10)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" /> Backup &amp; Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download a copy of all your data, or restore it from a backup file. Nothing leaves your device.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={onExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </CardContent>

      <AlertDialog open={!!pending} onOpenChange={(o) => { if (!o) setPending(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces your current data with {count} {count === 1 ? 'entry' : 'entries'}
              {dateLabel ? ` from ${dateLabel}` : ''}. This can’t be undone — export first if you want to keep what’s here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
