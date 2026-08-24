import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { useT } from '@/i18n';
import type { CashbookEntry } from '@/types/cashbook';
import { getCategoryBreakdown } from '@/lib/cashbookCalculations';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

export function CashbookCharts({ entries }: { entries: CashbookEntry[] }) {
  const t = useT();
  const { format } = useCurrency();

  const expenseCategories = useMemo(() => getCategoryBreakdown(entries, 'cash_out'), [entries]);

  const pieData = useMemo(() => {
    return expenseCategories.map((item) => ({
      name: t(`cashbook.cat.${item.category}` as never),
      value: item.amount,
    }));
  }, [expenseCategories, t]);

  if (pieData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('cashbook.cashOut')} Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => format(Number(val) || 0)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
