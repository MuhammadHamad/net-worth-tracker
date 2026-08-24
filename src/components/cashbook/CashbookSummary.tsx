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
      <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t('cashbook.cashIn')}
            </span>
            <div className="rounded-full bg-emerald-500/20 p-1 text-emerald-600 dark:text-emerald-400">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300">
            {format(metrics.totalIn)}
          </div>
        </CardContent>
      </Card>

      {/* Cash Out */}
      <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-destructive">
              {t('cashbook.cashOut')}
            </span>
            <div className="rounded-full bg-destructive/20 p-1 text-destructive">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold tracking-tight text-destructive">
            {format(metrics.totalOut)}
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className={cn(
        'border-primary/20',
        metrics.netFlow >= 0 ? 'bg-primary/5 dark:bg-primary/10' : 'bg-destructive/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('cashbook.netFlow')}
            </span>
            <div className="rounded-full bg-primary/20 p-1 text-primary">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className={cn(
            'mt-2 text-xl font-extrabold tracking-tight',
            metrics.netFlow >= 0 ? 'text-primary' : 'text-destructive'
          )}>
            {format(metrics.netFlow)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
