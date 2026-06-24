import { TrendingUp, ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { useT, type TranslationKey } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { AuthForm } from './AuthForm';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

const PERKS: { icon: typeof ShieldCheck; key: TranslationKey }[] = [
  { icon: ShieldCheck, key: 'welcome.perkPrivate' },
  { icon: WifiOff, key: 'welcome.perkOffline' },
  { icon: RefreshCw, key: 'welcome.perkSync' },
];

export function WelcomeScreen() {
  const t = useT();
  const setAuthSkipped = useUiStore((s) => s.setAuthSkipped);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center"><LanguageToggle /></div>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">NetWorth Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('welcome.tagline')}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <AuthForm showIntro={false} />
          </CardContent>
        </Card>

        <button
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setAuthSkipped(true)}
        >
          {t('welcome.continueWithout')}
        </button>

        <ul className="mt-6 space-y-2">
          {PERKS.map((p) => (
            <li key={p.key} className="flex items-center gap-2 text-xs text-muted-foreground">
              <p.icon className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
              {t(p.key)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
