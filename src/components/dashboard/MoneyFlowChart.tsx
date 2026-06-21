import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getMoneyFlowData } from '@/lib/chartTransformers';

export function MoneyFlowChart() {
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();
  const data = useMemo(() => getMoneyFlowData(transactions, 6), [transactions]);

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Flow</CardTitle>
        <p className="text-sm text-muted-foreground">Income vs expenses, last 6 months</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => compact(Number(v))}
              />
              <Tooltip
                formatter={(value, name) => [format(Number(value)), name === 'income' ? 'Income' : 'Expense']}
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="Add income or expenses to see your money flow." />
        )}
      </CardContent>
    </Card>
  );
}

function compact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function EmptyChart({ label }: { label: string }) {
  return <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
