import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NetWorthHeroCard } from '@/components/dashboard/NetWorthHeroCard';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { MoneyFlowChart, NetWorthHistoryChart } from '@/components/dashboard/LazyCharts';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AddTransactionDialog } from '@/components/forms/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { useNetWorthMetrics } from '@/hooks/useNetWorthMetrics';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useProfileStore } from '@/store/useProfileStore';
import { todayISO } from '@/lib/formatters';

export default function Dashboard() {
  const metrics = useNetWorthMetrics();
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const saveSnapshot = useSnapshotStore((s) => s.saveSnapshot);
  const name = useProfileStore((s) => s.profile.name);

  // Record (or refresh) today's snapshot so the history chart accumulates day by day.
  useEffect(() => {
    const today = todayISO();
    const existing = snapshots.find((s) => s.date === today);
    if (!existing || existing.netWorth !== metrics.netWorth) {
      saveSnapshot({
        date: today,
        netWorth: metrics.netWorth,
        totalAssets: metrics.totalAssets,
        totalDebt: metrics.totalDebt,
        cashBalance: metrics.cashBalance,
      });
    }
    // Re-run when the computed net worth changes within the day.
  }, [metrics.netWorth, metrics.totalAssets, metrics.totalDebt, metrics.cashBalance, snapshots, saveSnapshot]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={name ? `Hello, ${name}` : 'Dashboard'}
        description="Your complete financial picture, at a glance."
        action={
          <AddTransactionDialog
            trigger={
              <Button className="hidden gap-2 md:inline-flex">
                <Plus className="h-4 w-4" /> Add Entry
              </Button>
            }
          />
        }
      />
      <NetWorthHeroCard />
      <SummaryCards />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NetWorthHistoryChart />
        <MoneyFlowChart />
      </div>
      <RecentActivity />
    </div>
  );
}
