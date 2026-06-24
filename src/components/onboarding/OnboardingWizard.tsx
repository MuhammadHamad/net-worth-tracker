import { useState } from 'react';
import { TrendingUp, Wallet, Gem, Car, LineChart, ArrowRight, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileStore } from '@/store/useProfileStore';
import { useUiStore } from '@/store/useUiStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { CURRENCIES, type Asset, type AssetCategory, type Currency } from '@/types';
import { todayISO, nowISO, formatCurrency } from '@/lib/formatters';
import { useT, type TranslationKey } from '@/i18n';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StartingItem { key: string; labelKey: TranslationKey; category: AssetCategory; icon: LucideIcon }

const STARTING_ITEMS: StartingItem[] = [
  { key: 'cash', labelKey: 'ob.cash', category: 'savings', icon: Wallet },
  { key: 'gold', labelKey: 'ob.gold', category: 'precious_metals', icon: Gem },
  { key: 'vehicle', labelKey: 'ob.vehicle', category: 'vehicle', icon: Car },
  { key: 'investments', labelKey: 'ob.investments', category: 'investments', icon: LineChart },
];

export function OnboardingWizard() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const setOnboardingDone = useUiStore((s) => s.setOnboardingDone);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState<Currency>(profile.currency);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const total = STARTING_ITEMS.reduce((sum, it) => sum + (parseFloat(amounts[it.key]) || 0), 0);

  const finish = () => {
    updateProfile({ name: name.trim(), currency });
    for (const it of STARTING_ITEMS) {
      const value = parseFloat(amounts[it.key]) || 0;
      if (value > 0) {
        addTransaction({
          id: crypto.randomUUID(), type: 'asset', name: t(it.labelKey), estimatedValue: value,
          category: it.category, dateAdded: todayISO(), createdAt: nowISO(),
        } as Asset);
      }
    }
    setOnboardingDone(true);
    toast.success(t('toast.allSet'));
  };

  const skip = () => {
    if (name.trim() || currency !== profile.currency) updateProfile({ name: name.trim(), currency });
    setOnboardingDone(true);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center"><LanguageToggle /></div>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-brand-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {step === 0 ? t('ob.welcome') : t('ob.haveNow')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 0 ? t('ob.intro') : t('ob.haveNowSub')}
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {step === 0 ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-name">{t('form.yourName')}</Label>
                  <Input id="ob-name" placeholder={t('form.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('form.currency')}</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.symbol} · {c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full gap-1" onClick={() => setStep(1)}>
                  {t('common.continue')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {STARTING_ITEMS.map((it) => (
                    <div key={it.key} className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-muted-foreground">
                        <it.icon className="h-4 w-4" /> {t(it.labelKey)}
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={amounts[it.key] ?? ''}
                        onChange={(e) => setAmounts((a) => ({ ...a, [it.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <span className="text-sm text-muted-foreground">{t('ob.startingNetWorth')}</span>
                  <span className="text-base font-bold">{formatCurrency(total, currency)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('common.back')}
                  </Button>
                  <Button className="flex-1" onClick={finish}>
                    {total > 0 ? t('ob.finish') : t('ob.skipForNow')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <button
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={skip}
        >
          {t('ob.skipSetup')}
        </button>
      </div>
    </div>
  );
}
