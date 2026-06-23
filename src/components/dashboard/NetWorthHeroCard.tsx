import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { cn } from '@/lib/utils';

export function NetWorthHeroCard() {
  const metrics = useNetWorthMetrics();
  const { format } = useCurrency();
  const snapshots = useSnapshotStore((s) => s.snapshots);

  // % change vs the most recent earlier snapshot (yesterday or last recorded day).
  const { pct, direction } = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const prev = sorted.filter((s) => s.netWorth !== metrics.netWorth).at(-1) ?? sorted.at(-2);
    if (!prev || prev.netWorth === 0) return { pct: null as number | null, direction: 'flat' as const };
    const change = ((metrics.netWorth - prev.netWorth) / Math.abs(prev.netWorth)) * 100;
    return {
      pct: change,
      direction: change > 0 ? ('up' as const) : change < 0 ? ('down' as const) : ('flat' as const),
    };
  }, [snapshots, metrics.netWorth]);

  const positive = metrics.netWorth >= 0;

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
          {pct === null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-white/80">
              <Minus className="h-3.5 w-3.5" /> No prior data
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
              {direction === 'flat' && <Minus className="h-3.5 w-3.5" />}
              {pct > 0 ? '+' : ''}{pct.toFixed(1)}% vs last snapshot
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
