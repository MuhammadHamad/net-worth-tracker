import { Wallet, TrendingDown, Banknote, ArrowDownCircle, HandCoins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface MetricItem {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'neutral' | 'positive' | 'negative';
}

export function SummaryCards() {
  const m = useNetWorthMetrics();
  const { format } = useCurrency();

  const items: MetricItem[] = [
    { label: 'Total Assets', value: m.totalAssets, icon: Wallet, tone: 'positive' },
    { label: 'Total Debt', value: m.totalDebt, icon: TrendingDown, tone: 'negative' },
    { label: 'Cash Balance', value: m.cashBalance, icon: Banknote, tone: m.cashBalance >= 0 ? 'positive' : 'negative' },
    { label: 'Total Income', value: m.totalIncome, icon: ArrowDownCircle, tone: 'neutral' },
    { label: 'Money Lent', value: m.totalLent, icon: HandCoins, tone: 'neutral' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
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
      ))}
    </div>
  );
}
