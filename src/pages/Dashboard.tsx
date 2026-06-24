import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
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
import { useUiStore } from '@/store/useUiStore';
import { todayISO, formatCurrency } from '@/lib/formatters';
import { highestMilestone } from '@/lib/milestones';
import { useT } from '@/i18n';

export default function Dashboard() {
  const t = useT();
  const metrics = useNetWorthMetrics();
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const saveSnapshot = useSnapshotStore((s) => s.saveSnapshot);
  const name = useProfileStore((s) => s.profile.name);
  const currency = useProfileStore((s) => s.profile.currency);
  const milestoneReached = useUiStore((s) => s.milestoneReached);
  const setMilestoneReached = useUiStore((s) => s.setMilestoneReached);

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

  // Celebrate crossing a new net-worth milestone. The first observation only
  // baselines (so existing balances never trigger a retroactive celebration).
  useEffect(() => {
    const current = highestMilestone(metrics.netWorth);
    if (milestoneReached < 0) { setMilestoneReached(current); return; }
    if (current > milestoneReached) {
      toast.success(t('dashboard.milestoneTitle'), {
        description: t('dashboard.milestoneDesc', { amount: formatCurrency(current, currency) }),
        duration: 6000,
      });
      setMilestoneReached(current);
    } else if (current < milestoneReached) {
      setMilestoneReached(current); // dropped below — allow re-celebrating later
    }
  }, [metrics.netWorth, milestoneReached, setMilestoneReached, currency, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={name ? t('dashboard.greeting', { name }) : t('nav.dashboard')}
        description={t('dashboard.subtitle')}
        action={
          <AddTransactionDialog
            trigger={
              <Button className="hidden gap-2 md:inline-flex">
                <Plus className="h-4 w-4" /> {t('common.addEntry')}
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
