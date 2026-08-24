import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCashbookStore } from '@/store/useCashbookStore';
import { useT } from '@/i18n';
import type { PeriodType, CashbookPeriodFilter } from '@/types/cashbook';
import { filterCashbookEntries, calculateCashbookMetrics } from '@/lib/cashbookCalculations';
import { CashbookSummary } from '@/components/cashbook/CashbookSummary';
import { CashbookEntryForm } from '@/components/cashbook/CashbookEntryForm';
import { CashbookEntryList } from '@/components/cashbook/CashbookEntryList';
import { CashbookCharts } from '@/components/cashbook/CashbookCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Cashbook() {
  const t = useT();
  const entries = useCashbookStore((s) => s.entries);

  const now = new Date();
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [quarter, setQuarter] = useState<number>(Math.ceil((now.getMonth() + 1) / 3));

  const filter: CashbookPeriodFilter = useMemo(
    () => ({ periodType, year, month, quarter }),
    [periodType, year, month, quarter]
  );

  const filteredEntries = useMemo(
    () => filterCashbookEntries(entries, filter),
    [entries, filter]
  );

  const metrics = useMemo(
    () => calculateCashbookMetrics(filteredEntries),
    [filteredEntries]
  );

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(now.getFullYear());
    entries.forEach((e) => {
      if (e.date) {
        const y = parseInt(e.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [entries, now]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.cashbook')}
        description={t('cashbook.subtitle')}
        action={<CashbookEntryForm />}
      />

      {/* Period Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{t('cashbook.period')}:</span>
          <div className="flex rounded-lg bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setPeriodType('weekly')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                periodType === 'weekly' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.weekly')}
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('monthly')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                periodType === 'monthly' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('quarterly')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                periodType === 'quarterly' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.quarterly')}
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('yearly')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                periodType === 'yearly' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.yearly')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <Select value={String(year)} onValueChange={(val) => setYear(parseInt(val, 10))}>
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month selector (if monthly) */}
          {periodType === 'monthly' && (
            <Select value={String(month)} onValueChange={(val) => setMonth(parseInt(val, 10))}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={idx + 1} value={String(idx + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Quarter selector (if quarterly) */}
          {periodType === 'quarterly' && (
            <Select value={String(quarter)} onValueChange={(val) => setQuarter(parseInt(val, 10))}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <CashbookSummary metrics={metrics} />

      {/* Charts & List Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashbookEntryList entries={filteredEntries} />
        </div>
        <div>
          <CashbookCharts entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}
