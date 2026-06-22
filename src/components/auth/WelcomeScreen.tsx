import { TrendingUp, ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { Card, CardContent } from '@/components/ui/card';
import { AuthForm } from './AuthForm';

const PERKS = [
  { icon: ShieldCheck, text: 'Private — your data, locked to your account' },
  { icon: WifiOff, text: 'Works fully offline' },
  { icon: RefreshCw, text: 'Syncs across your devices' },
];

export function WelcomeScreen() {
  const setAuthSkipped = useUiStore((s) => s.setAuthSkipped);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">NetWorth Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Know exactly what you’re worth — in seconds.</p>
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
          Continue without an account
        </button>

        <ul className="mt-6 space-y-2">
          {PERKS.map((p) => (
            <li key={p.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <p.icon className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
              {p.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
