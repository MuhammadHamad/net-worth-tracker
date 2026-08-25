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
      <Card className="border-emerald-200 bg-emerald-50/80 shadow-xs dark:border-emerald-800/40 dark:bg-emerald-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
              {t('cashbook.cashIn')}
            </span>
            <div className="rounded-full bg-emerald-600 p-1.5 text-white dark:bg-emerald-500">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-300">
            {format(metrics.totalIn)}
          </div>
        </CardContent>
      </Card>

      {/* Cash Out */}
      <Card className="border-rose-200 bg-rose-50/80 shadow-xs dark:border-rose-800/40 dark:bg-rose-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
              {t('cashbook.cashOut')}
            </span>
            <div className="rounded-full bg-rose-600 p-1.5 text-white dark:bg-rose-500">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-rose-800 dark:text-rose-300">
            {format(metrics.totalOut)}
          </div>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className={cn(
        'shadow-xs',
        metrics.netFlow >= 0
          ? 'border-blue-200 bg-blue-50/80 dark:border-slate-800 dark:bg-slate-900/60'
          : 'border-rose-200 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {t('cashbook.netFlow')}
            </span>
            <div className="rounded-full bg-blue-600 p-1.5 text-white dark:bg-blue-500">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className={cn(
            'mt-2 text-2xl font-black tracking-tight',
            metrics.netFlow >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-rose-800 dark:text-rose-300'
          )}>
            {format(metrics.netFlow)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
