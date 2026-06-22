import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Recharts is heavy (~hundreds of KB). Split it into its own chunk so the initial
// app load stays small; the charts stream in after the shell paints.
const MoneyFlowChartInner = lazy(() => import('./MoneyFlowChart').then((m) => ({ default: m.MoneyFlowChart })));
const NetWorthHistoryChartInner = lazy(() => import('./NetWorthHistoryChart').then((m) => ({ default: m.NetWorthHistoryChart })));

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="flex h-[332px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </CardContent>
    </Card>
  );
}

export function MoneyFlowChart() {
  return <Suspense fallback={<ChartSkeleton />}><MoneyFlowChartInner /></Suspense>;
}

export function NetWorthHistoryChart() {
  return <Suspense fallback={<ChartSkeleton />}><NetWorthHistoryChartInner /></Suspense>;
}
