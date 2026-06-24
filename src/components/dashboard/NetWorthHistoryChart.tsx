import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getNetWorthHistoryData } from '@/lib/chartTransformers';
import { useT, type TranslationKey } from '@/i18n';
import type { TimeRange } from '@/types';

const RANGES: { value: TimeRange; labelKey: TranslationKey }[] = [
  { value: 'week', labelKey: 'range.week' },
  { value: 'month', labelKey: 'range.month' },
  { value: 'year', labelKey: 'range.year' },
  { value: 'all', labelKey: 'range.all' },
];

export function NetWorthHistoryChart() {
  const t = useT();
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const { format } = useCurrency();
  const [range, setRange] = useState<TimeRange>('month');

  const data = useMemo(() => getNetWorthHistoryData(snapshots, range), [snapshots, range]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{t('chart.history')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('chart.historySub')}</p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <TabsList className="grid h-8 w-full grid-cols-4 sm:flex sm:w-auto">
            {RANGES.map((r) => (
              <TabsTrigger key={r.value} value={r.value} className="px-2.5 py-1 text-xs">{t(r.labelKey)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length >= 2 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => compact(Number(v))}
              />
              <Tooltip
                formatter={(value) => [format(Number(value)), t('chart.netWorth')]}
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
              />
              <Area type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#nwGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-center text-sm text-muted-foreground">
            {t('chart.historyEmpty')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function compact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
