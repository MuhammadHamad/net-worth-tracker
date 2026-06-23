import { useState } from 'react';
import { TrendingUp, Wallet, Gem, Car, LineChart, ArrowRight, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileStore } from '@/store/useProfileStore';
import { useUiStore } from '@/store/useUiStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { CURRENCIES, type Asset, type AssetCategory, type Currency } from '@/types';
import { todayISO, nowISO, formatCurrency } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StartingItem { key: string; label: string; category: AssetCategory; icon: LucideIcon }

const STARTING_ITEMS: StartingItem[] = [
  { key: 'cash', label: 'Cash & savings', category: 'savings', icon: Wallet },
  { key: 'gold', label: 'Gold & valuables', category: 'precious_metals', icon: Gem },
  { key: 'vehicle', label: 'Vehicle', category: 'vehicle', icon: Car },
  { key: 'investments', label: 'Investments', category: 'investments', icon: LineChart },
];

export function OnboardingWizard() {
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
          id: crypto.randomUUID(), type: 'asset', name: it.label, estimatedValue: value,
          category: it.category, dateAdded: todayISO(), createdAt: nowISO(),
        } as Asset);
      }
    }
    setOnboardingDone(true);
    toast.success('You’re all set!');
  };

  const skip = () => {
    if (name.trim() || currency !== profile.currency) updateProfile({ name: name.trim(), currency });
    setOnboardingDone(true);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {step === 0 ? 'Welcome 👋' : 'What do you have right now?'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 0
              ? 'Let’s get your money in one place. Takes about 30 seconds.'
              : 'Add what you own — round numbers are fine, you can edit anytime.'}
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {step === 0 ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-name">Your name</Label>
                  <Input id="ob-name" placeholder="e.g. Hammad" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
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
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {STARTING_ITEMS.map((it) => (
                    <div key={it.key} className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-muted-foreground">
                        <it.icon className="h-4 w-4" /> {it.label}
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
                  <span className="text-sm text-muted-foreground">Starting net worth</span>
                  <span className="text-base font-bold">{formatCurrency(total, currency)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button className="flex-1" onClick={finish}>
                    {total > 0 ? 'Finish' : 'Skip for now'}
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
          Skip setup
        </button>
      </div>
    </div>
  );
}
