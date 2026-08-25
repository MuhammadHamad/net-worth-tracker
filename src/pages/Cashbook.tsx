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

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const currentQuarter = useMemo(() => Math.ceil((new Date().getMonth() + 1) / 3), []);

  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [quarter, setQuarter] = useState<number>(currentQuarter);

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
    yearsSet.add(currentYear);
    entries.forEach((e) => {
      if (e.date) {
        const y = parseInt(e.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [entries, currentYear]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.cashbook')}
        description={t('cashbook.subtitle')}
        action={<CashbookEntryForm />}
      />

      {/* Period Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
        <span className="text-xs font-semibold text-muted-foreground">{t('cashbook.period')}:</span>
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Time Period Dropdown */}
          <Select value={periodType} onValueChange={(val) => setPeriodType(val as PeriodType)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t('cashbook.weekly')}</SelectItem>
              <SelectItem value="monthly">{t('cashbook.monthly')}</SelectItem>
              <SelectItem value="quarterly">{t('cashbook.quarterly')}</SelectItem>
              <SelectItem value="yearly">{t('cashbook.yearly')}</SelectItem>
            </SelectContent>
          </Select>

          {/* 2. Month Selector (if monthly) */}
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

          {/* 2b. Quarter Selector (if quarterly) */}
          {periodType === 'quarterly' && (
            <Select value={String(quarter)} onValueChange={(val) => setQuarter(parseInt(val, 10))}>
              <SelectTrigger className="h-8 w-36 text-xs">
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

          {/* 3. Year Selector */}
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
