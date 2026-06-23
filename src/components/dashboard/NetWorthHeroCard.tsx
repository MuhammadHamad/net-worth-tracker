import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { getNetWorthTrend } from '@/lib/chartTransformers';
import { cn } from '@/lib/utils';

export function NetWorthHeroCard() {
  const metrics = useNetWorthMetrics();
  const { format } = useCurrency();
  const snapshots = useSnapshotStore((s) => s.snapshots);

  // Real change versus ~a week ago (or since you started, if newer).
  const trend = useMemo(
    () => getNetWorthTrend(snapshots, metrics.netWorth, 7),
    [snapshots, metrics.netWorth]
  );

  const positive = metrics.netWorth >= 0;
  const direction = !trend.hasBaseline || trend.delta === 0 ? 'flat' : trend.delta > 0 ? 'up' : 'down';
  const period = trend.sinceStart ? 'so far' : 'this week';

  return (
    <div className="bg-brand-gradient relative overflow-hidden rounded-2xl p-6 text-white shadow-lg md:p-8">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-sm font-medium text-white/75">Total Net Worth</p>
        <div className={cn('mt-2 text-4xl font-bold tracking-tight md:text-5xl', positive ? 'text-white' : 'text-red-200')}>
          {format(metrics.netWorth)}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          {!trend.hasBaseline ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-white/80">
              <Sparkles className="h-3.5 w-3.5" /> Your starting point — watch it grow
            </span>
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium',
                direction === 'up' && 'bg-emerald-400/20 text-emerald-100',
                direction === 'down' && 'bg-red-400/20 text-red-100',
                direction === 'flat' && 'bg-white/15 text-white/80'
              )}
            >
              {direction === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
              {direction === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
              {trend.delta >= 0 ? '+' : '−'}{format(Math.abs(trend.delta))}
              {trend.pct !== null && <span className="opacity-75"> · {trend.pct >= 0 ? '+' : ''}{trend.pct.toFixed(1)}%</span>}
              <span className="opacity-75"> {period}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
