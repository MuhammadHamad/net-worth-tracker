import { ArrowDownCircle, ArrowUpCircle, Scale, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { useT } from '@/i18n';
import type { CashbookMetrics } from '@/lib/cashbookCalculations';
import { CashbookEntryForm } from './CashbookEntryForm';
import { cn } from '@/lib/utils';

export function CashbookSummary({ metrics }: { metrics: CashbookMetrics }) {
  const t = useT();
  const { format } = useCurrency();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Cash In Card (Click to Add Cash In) */}
      <CashbookEntryForm
        defaultType="cash_in"
        trigger={
          <div className="group cursor-pointer">
            <Card className="border-l-4 border-l-emerald-600 border-border bg-card shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-emerald-500 group-hover:shadow-md group-active:translate-y-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {t('cashbook.cashIn')}
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110">
                    <Plus className="h-3.5 w-3.5" />
                    <ArrowDownCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  {format(metrics.totalIn)}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />

      {/* Cash Out Card (Click to Add Cash Out) */}
      <CashbookEntryForm
        defaultType="cash_out"
        trigger={
          <div className="group cursor-pointer">
            <Card className="border-l-4 border-l-rose-600 border-border bg-card shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-rose-500 group-hover:shadow-md group-active:translate-y-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    {t('cashbook.cashOut')}
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-rose-500/15 p-1.5 text-rose-600 dark:text-rose-400 transition-transform duration-200 group-hover:scale-110">
                    <Plus className="h-3.5 w-3.5" />
                    <ArrowUpCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                  {format(metrics.totalOut)}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />

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
