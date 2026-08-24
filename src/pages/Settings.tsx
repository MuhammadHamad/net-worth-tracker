import { useState } from 'react';
import { Moon, Sun, ShieldCheck, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudSyncCard } from '@/components/settings/CloudSyncCard';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { BackupCard } from '@/components/settings/BackupCard';
import { DangerZoneCard } from '@/components/settings/DangerZoneCard';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore, type Palette } from '@/store/useThemeStore';
import { CURRENCIES, type Currency } from '@/types';
import { cn } from '@/lib/utils';
import { sanitizeAmount } from '@/lib/amount';
import { useT } from '@/i18n';

// Theme names are proper nouns kept in both languages.
const THEMES: { value: Palette; label: string; swatch: string }[] = [
  { value: 'classic', label: 'Classic', swatch: 'linear-gradient(135deg, hsl(221 83% 53%), hsl(243 75% 52%))' },
  { value: 'aurora', label: 'Aurora', swatch: 'linear-gradient(135deg, hsl(266 85% 60%), hsl(288 80% 60%) 45%, hsl(196 90% 52%))' },
];

export default function Settings() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const palette = useThemeStore((s) => s.palette);
  const setPalette = useThemeStore((s) => s.setPalette);

  const symbol = CURRENCIES.find((c) => c.value === profile.currency)?.symbol ?? '';
  const [cashInput, setCashInput] = useState(profile.openingCash ? String(profile.openingCash) : '');
  const onCashChange = (raw: string) => {
    setCashInput(raw);
    if (raw.trim() === '') { updateProfile({ openingCash: 0 }); return; }
    const n = sanitizeAmount(raw);
    if (n !== null) updateProfile({ openingCash: n });
  };

  return (
    <div>
      <PageHeader title={t('nav.settings')} description={t('settings.subtitle')} />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('form.yourName')}</Label>
              <Input
                id="name"
                placeholder={t('form.namePlaceholder')}
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('form.currency')}</Label>
              <Select value={profile.currency} onValueChange={(v) => updateProfile({ currency: v as Currency })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.symbol} · {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('settings.currencyHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opening-cash">{t('settings.startingCash')}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{symbol}</span>
                <Input
                  id="opening-cash"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  className="ps-8"
                  value={cashInput}
                  onChange={(e) => onCashChange(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">{t('settings.startingCashHint')}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium">Session & Account</p>
                <p className="text-xs text-muted-foreground">Sign out of your active session</p>
              </div>
              <LogoutButton variant="outline" />
            </div>
          </CardContent>
        </Card>

        <CloudSyncCard />

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{t('settings.language')}</p>
              <LanguageToggle />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('settings.theme')}</p>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((th) => {
                  const active = palette === th.value;
                  return (
                    <button
                      key={th.value}
                      type="button"
                      onClick={() => setPalette(th.value)}
                      className={cn(
                        'relative overflow-hidden rounded-xl border p-3 text-start transition-all active:scale-[0.98]',
                        active ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-input hover:bg-accent'
                      )}
                    >
                      <div className="h-14 w-full rounded-lg shadow-sm" style={{ backgroundImage: th.swatch }} />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{th.label}</span>
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
                <p className="text-sm font-medium">{t('settings.darkMode')}</p>
                <p className="text-xs text-muted-foreground">{mode === 'dark' ? t('common.on') : t('common.off')}</p>
              </div>
              <Button variant="outline" onClick={toggleMode} className="gap-2">
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {mode === 'dark' ? t('settings.switchLight') : t('settings.switchDark')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <BackupCard />

        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-medium">{t('settings.privacyTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {t('settings.privacyDesc')}
              </p>
            </div>
          </CardContent>
        </Card>

        <DangerZoneCard />

        <Separator />
        <p className="text-center text-xs text-muted-foreground">NetWorth Tracker · MVP</p>
      </div>
    </div>
  );
}
