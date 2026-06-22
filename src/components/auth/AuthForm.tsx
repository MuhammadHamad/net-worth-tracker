import { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'login' | 'signup';

/** Shared email + password sign-up / log-in form, used by the welcome screen and Settings. */
export function AuthForm({ showIntro = true }: { showIntro?: boolean }) {
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);

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
      const { error, needsConfirmation } = await signUp(email.trim(), password);
      setBusy(false);
      if (error) { toast.error(error); return; }
      if (needsConfirmation) { setConfirmSent(true); return; }
      toast.success('Account created');
    } else {
      const error = await signIn(email.trim(), password);
      setBusy(false);
      if (error) { toast.error(error); return; }
      toast.success('Signed in');
    }
  };

  if (confirmSent) {
    return (
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
    );
  }

  return (
    <div className="space-y-3">
      {showIntro && (
        <p className="text-sm text-muted-foreground">
          {mode === 'login'
            ? 'Log in to back up your data and sync across devices.'
            : 'Create an account to back up your data and sync across devices.'}{' '}
          Optional — the app works fully offline without it.
        </p>
      )}

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
        <button className="text-primary hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
