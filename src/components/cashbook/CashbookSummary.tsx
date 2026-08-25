import { ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { useT } from '@/i18n';
import type { CashbookMetrics } from '@/lib/cashbookCalculations';
import { cn } from '@/lib/utils';

export function CashbookSummary({ metrics }: { metrics: CashbookMetrics }) {
  const t = useT();
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Cash In */}
      <Card className="border-l-4 border-l-emerald-600 border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('cashbook.cashIn')}
            </span>
            <div className="rounded-full bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {format(metrics.totalIn)}
          </div>
        </CardContent>
      </Card>

      {/* Cash Out */}
      <Card className="border-l-4 border-l-rose-600 border-border bg-card shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('cashbook.cashOut')}
            </span>
            <div className="rounded-full bg-rose-500/15 p-1.5 text-rose-600 dark:text-rose-400">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {format(metrics.totalOut)}
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className={cn(
        'border-l-4 border-border bg-card shadow-xs',
        metrics.netFlow >= 0 ? 'border-l-blue-600' : 'border-l-rose-600'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('cashbook.netFlow')}
            </span>
            <div className={cn(
              'rounded-full p-1.5',
              metrics.netFlow >= 0 ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            )}>
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className={cn(
            'mt-2 text-2xl font-black tracking-tight',
            metrics.netFlow >= 0 ? 'text-foreground' : 'text-rose-600 dark:text-rose-400'
          )}>
            {format(metrics.netFlow)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
