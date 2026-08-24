import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Sparkles, Banknote, ArrowUpRight } from 'lucide-react';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { getNetWorthTrend } from '@/lib/chartTransformers';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

export function NetWorthHeroCard() {
  const t = useT();
  const metrics = useNetWorthMetrics();
  const { format } = useCurrency();
  const snapshots = useSnapshotStore((s) => s.snapshots);

  // Real change versus ~a week ago (or since you started, if newer).
  const trend = useMemo(
    () => getNetWorthTrend(snapshots, metrics.netWorth, 7),
    [snapshots, metrics.netWorth]
  );

  const positive = metrics.netWorth >= 0;
  const cashPositive = metrics.cashBalance >= 0;
  const direction = !trend.hasBaseline || trend.delta === 0 ? 'flat' : trend.delta > 0 ? 'up' : 'down';
  const period = trend.sinceStart ? t('hero.soFar') : t('hero.thisWeek');

  return (
    <div className="bg-brand-gradient relative overflow-hidden rounded-2xl p-6 text-white shadow-lg md:p-8">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
        {/* Total Net Worth */}
        <div>
          <p className="text-sm font-medium text-white/75">{t('hero.totalNetWorth')}</p>
          <div className={cn('mt-2 text-4xl font-bold tracking-tight md:text-5xl', positive ? 'text-white' : 'text-red-200')}>
            {format(metrics.netWorth)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            {!trend.hasBaseline ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-white/80">
                <Sparkles className="h-3.5 w-3.5" /> {t('hero.startingPoint')}
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

        {/* Highlighted Cash Balance (Clickable) */}
        <Link
          to="/transactions"
          className="group block rounded-xl border border-white/30 bg-white/20 p-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-white/25 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <div className="rounded-md bg-emerald-400/30 p-1 text-emerald-100 transition-transform duration-200 group-hover:scale-110">
                <Banknote className="h-4 w-4" />
              </div>
              <span>{t('summary.cashBalance')}</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-white/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </div>
          <div className={cn('mt-2 text-3xl font-extrabold tracking-tight md:text-4xl', cashPositive ? 'text-emerald-100' : 'text-red-200')}>
            {format(metrics.cashBalance)}
          </div>
        </Link>
      </div>
    </div>
  );
}
