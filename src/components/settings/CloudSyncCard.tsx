import { Cloud, CloudOff, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
import { sync } from '@/lib/sync';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthForm } from '@/components/auth/AuthForm';

export function CloudSyncCard() {
  // Only render when the deployment is wired to a Supabase project.
  if (!isSupabaseConfigured) return null;
  return <CloudSyncCardInner />;
}

function CloudSyncCardInner() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const signOut = useAuthStore((s) => s.signOut);
  const { status, error, lastSyncedAt } = useSyncStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" /> Cloud Sync
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Checking session…</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <SyncStatusLine status={status} error={error} lastSyncedAt={lastSyncedAt} />
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => void sync()} disabled={status === 'syncing'}>
                <RefreshCw className={status === 'syncing' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Sync now
              </Button>
              <Button variant="outline" className="gap-2" onClick={async () => { await signOut(); toast.success('Signed out'); }}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        ) : (
          <AuthForm />
        )}
      </CardContent>
    </Card>
  );
}

function SyncStatusLine({ status, error, lastSyncedAt }: { status: string; error: string | null; lastSyncedAt: string | null }) {
  if (status === 'syncing') return <p className="text-xs text-muted-foreground">Syncing…</p>;
  if (status === 'offline') return <p className="flex items-center gap-1 text-xs text-muted-foreground"><CloudOff className="h-3 w-3" /> Offline — will sync when reconnected</p>;
  if (status === 'error') return <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> {error ?? 'Sync error'}</p>;

  let label = 'Ready to sync';
  if (lastSyncedAt) {
    try { label = `Synced ${formatDistanceToNow(parseISO(lastSyncedAt), { addSuffix: true })}`; } catch { /* keep default */ }
  }
  return <p className="text-xs text-muted-foreground">{label}</p>;
}
