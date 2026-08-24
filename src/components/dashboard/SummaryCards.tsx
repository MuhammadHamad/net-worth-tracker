import { Wallet, TrendingDown, Banknote, ArrowDownCircle, HandCoins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import { useT, type TranslationKey } from '@/i18n';

interface MetricItem {
  labelKey: TranslationKey;
  value: number;
  icon: LucideIcon;
  tone: 'neutral' | 'positive' | 'negative';
  highlighted?: boolean;
}

export function SummaryCards() {
  const t = useT();
  const m = useNetWorthMetrics();
  const { format } = useCurrency();

  const items: MetricItem[] = [
    { labelKey: 'summary.cashBalance', value: m.cashBalance, icon: Banknote, tone: m.cashBalance >= 0 ? 'positive' : 'negative', highlighted: true },
    { labelKey: 'summary.totalAssets', value: m.totalAssets, icon: Wallet, tone: 'positive' },
    { labelKey: 'summary.totalDebt', value: m.totalDebt, icon: TrendingDown, tone: 'negative' },
    { labelKey: 'summary.totalIncome', value: m.totalIncome, icon: ArrowDownCircle, tone: 'neutral' },
    { labelKey: 'summary.moneyLent', value: m.totalLent, icon: HandCoins, tone: 'neutral' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        if (item.highlighted) {
          return (
            <Card
              key={item.labelKey}
              className="relative overflow-hidden border-2 border-emerald-600 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-700/20 dark:border-emerald-500/50 dark:from-emerald-950/80 dark:via-teal-950/70 dark:to-emerald-900/80"
            >
              <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-white/10 blur-xs" />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-100 dark:text-emerald-200">
                    {t(item.labelKey)}
                  </span>
                  <div className="rounded-full bg-white/20 p-1 text-white dark:bg-emerald-500/30 dark:text-emerald-300">
                    <item.icon className="h-4 w-4" />
                  </div>
                </div>
                <div
                  className={cn(
                    'mt-2 text-lg font-black tracking-tight',
                    item.value >= 0 ? 'text-white dark:text-emerald-100' : 'text-red-200 dark:text-red-300'
                  )}
                >
                  {format(item.value)}
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={item.labelKey}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t(item.labelKey)}</span>
                <item.icon
                  className={cn(
                    'h-4 w-4',
                    item.tone === 'positive' && 'text-[hsl(var(--success))]',
                    item.tone === 'negative' && 'text-destructive',
                    item.tone === 'neutral' && 'text-muted-foreground'
                  )}
                />
              </div>
              <div
                className={cn(
                  'mt-2 text-lg font-bold tracking-tight',
                  item.tone === 'negative' && item.value > 0 && 'text-destructive'
                )}
              >
                {format(item.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
