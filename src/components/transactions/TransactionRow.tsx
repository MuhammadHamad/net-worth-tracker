import type { Transaction } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { getTransactionView } from '@/lib/transactionView';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { RowActionsMenu } from '@/components/shared/RowActionsMenu';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const t = useT();
  const { format } = useCurrency();
  const v = getTransactionView(transaction, t);
  const date = 'date' in transaction ? transaction.date : transaction.dateAdded;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', v.iconClass)}>
        <v.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{v.title}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(date)} · {v.typeLabel}</p>
      </div>
      <div className={cn('shrink-0 text-sm font-semibold', v.amountClass)}>
        {v.sign}{format(v.amount)}
      </div>
      <RowActionsMenu transaction={transaction} deleteName={v.title} deleteDetail={format(v.amount)} />
    </div>
  );
}
