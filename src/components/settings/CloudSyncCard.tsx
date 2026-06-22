import { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, LogOut, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
import { sync } from '@/lib/sync';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CloudSyncCard() {
  // Only render when the deployment is wired to a Supabase project.
  if (!isSupabaseConfigured) return null;
  return <CloudSyncCardInner />;
}

type Mode = 'login' | 'signup';

function CloudSyncCardInner() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const { status, error, lastSyncedAt } = useSyncStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const onSubmit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    if (mode === 'signup') {
      const { error: err, needsConfirmation } = await signUp(email.trim(), password);
      setBusy(false);
      if (err) { toast.error(err); return; }
      if (needsConfirmation) { setConfirmSent(true); return; }
      toast.success('Account created');
    } else {
      const err = await signIn(email.trim(), password);
      setBusy(false);
      if (err) { toast.error(err); return; }
      toast.success('Signed in');
    }
  };

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
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => { await signOut(); toast.success('Signed out'); }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        ) : confirmSent ? (
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Confirm your email</p>
              <p className="text-xs text-muted-foreground">
                We sent a confirmation link to {email}. Click it once, then come back and log in.
              </p>
              <button className="mt-1 text-xs text-primary hover:underline" onClick={() => { setConfirmSent(false); setMode('login'); setPassword(''); }}>
                Back to log in
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Log in to back up your data and sync across devices.'
                : 'Create an account to back up your data and sync across devices.'}{' '}
              Optional — the app works fully offline without it.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="sync-email">Email</Label>
              <Input
                id="sync-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sync-password">Password</Label>
              <div className="relative">
                <Input
                  id="sync-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void onSubmit(); }}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full" onClick={() => void onSubmit()} disabled={busy || !canSubmit}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button className="text-primary hover:underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); }}>
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
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
