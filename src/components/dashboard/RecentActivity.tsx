import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getTransactionView } from '@/lib/transactionView';
import { formatShortDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

export function RecentActivity() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const { format } = useCurrency();

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
    [transactions]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recent.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('recent.empty')}</p>
        ) : (
          <ul className="divide-y">
            {recent.map((tx) => {
              const v = getTransactionView(tx, t);
              const date = 'date' in tx ? tx.date : tx.dateAdded;
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', v.iconClass)}>
                    <v.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{formatShortDate(date)} · {v.typeLabel}</p>
                  </div>
                  <div className={cn('shrink-0 text-sm font-semibold', v.amountClass)}>
                    {v.sign}{format(v.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
