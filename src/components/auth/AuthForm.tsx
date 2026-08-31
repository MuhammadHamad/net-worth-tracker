import { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { sync } from '@/lib/sync';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'login' | 'signup';

/** Shared email + password sign-up / log-in form, used by the welcome screen and Settings. */
export function AuthForm({ showIntro = true }: { showIntro?: boolean }) {
  const t = useT();
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
      if (error) { setBusy(false); toast.error(error); return; }
      if (needsConfirmation) { setBusy(false); setConfirmSent(true); return; }
      toast.success(t('toast.accountCreated'));
      await sync();
      setBusy(false);
    } else {
      const error = await signIn(email.trim(), password);
      if (error) { setBusy(false); toast.error(error); return; }
      toast.success(t('toast.signedIn'));
      await sync();
      setBusy(false);
    }
  };

  if (confirmSent) {
    return (
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">{t('auth.confirmTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {t('auth.confirmDesc', { email })}
          </p>
          <button className="mt-1 text-xs text-primary hover:underline" onClick={() => { setConfirmSent(false); setMode('login'); setPassword(''); }}>
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showIntro && (
        <p className="text-sm text-muted-foreground">
          {mode === 'login' ? t('auth.introLogin') : t('auth.introSignup')}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="sync-email">{t('auth.email')}</Label>
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
        <Label htmlFor="sync-password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="sync-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void onSubmit(); }}
            className="pe-10"
          />
          <button
            type="button"
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button className="w-full" onClick={() => void onSubmit()} disabled={busy || !canSubmit}>
        {busy ? t('common.pleaseWait') : mode === 'login' ? t('auth.login') : t('auth.createAccount')}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
        <button className="text-primary hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? t('auth.signup') : t('auth.login')}
        </button>
      </p>
    </div>
  );
}
