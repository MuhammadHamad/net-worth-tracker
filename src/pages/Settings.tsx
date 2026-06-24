import { Moon, Sun, ShieldCheck, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudSyncCard } from '@/components/settings/CloudSyncCard';
import { BackupCard } from '@/components/settings/BackupCard';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore, type Palette } from '@/store/useThemeStore';
import { CURRENCIES, type Currency } from '@/types';
import { cn } from '@/lib/utils';

const THEMES: { value: Palette; label: string; swatch: string }[] = [
  { value: 'classic', label: 'Classic', swatch: 'linear-gradient(135deg, hsl(221 83% 53%), hsl(243 75% 52%))' },
  { value: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg, hsl(266 85% 60%), hsl(288 80% 60%) 45%, hsl(196 90% 52%))' },
];

export default function Settings() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const palette = useThemeStore((s) => s.palette);
  const setPalette = useThemeStore((s) => s.setPalette);

  return (
    <div>
      <PageHeader title="Settings" description="Personalize your tracker. Everything stays on this device." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Hammad"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={profile.currency} onValueChange={(v) => updateProfile({ currency: v as Currency })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.symbol} · {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">All amounts across the app use this currency.</p>
            </div>
          </CardContent>
        </Card>

        <CloudSyncCard />

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => {
                  const active = palette === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setPalette(t.value)}
                      className={cn(
                        'relative overflow-hidden rounded-xl border p-3 text-left transition-all active:scale-[0.98]',
                        active ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-input hover:bg-accent'
                      )}
                    >
                      <div className="h-14 w-full rounded-lg shadow-sm" style={{ backgroundImage: t.swatch }} />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{t.label}</span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">{mode === 'dark' ? 'On' : 'Off'}</p>
              </div>
              <Button variant="outline" onClick={toggleMode} className="gap-2">
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <BackupCard />

        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-medium">Private by design</p>
              <p className="text-xs text-muted-foreground">
                No accounts, no servers. Your data lives only in this browser’s local storage and works fully offline.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-center text-xs text-muted-foreground">NetWorth Tracker · MVP</p>
      </div>
    </div>
  );
}
