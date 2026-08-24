import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Transaction, TransactionType } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { TransactionRow } from './TransactionRow';
import { getTransactionView } from '@/lib/transactionView';
import { useT, type TFn, type TranslationKey } from '@/i18n';

const TYPE_FILTERS: { value: TransactionType | 'all'; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'filter.all' },
  { value: 'income', labelKey: 'type.income' },
  { value: 'expense', labelKey: 'type.expense' },
  { value: 'asset', labelKey: 'type.asset' },
  { value: 'borrowed', labelKey: 'type.borrowed' },
  { value: 'lent', labelKey: 'type.lent' },
];

function searchText(tx: Transaction, t: TFn): string {
  const v = getTransactionView(tx, t);
  return `${v.title} ${v.subtitle} ${v.typeLabel}`.toLowerCase();
}

function getDate(tx: Transaction): string {
  return 'date' in tx ? tx.date : tx.dateAdded;
}

export function TransactionList() {
  const t = useT();
  const transactions = useTransactionStore((s) => s.transactions);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((tx) => (type === 'all' ? true : tx.type === type))
      .filter((tx) => (q ? searchText(tx, t).includes(q) : true))
      .sort((a, b) => getDate(b).localeCompare(getDate(a)) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, query, type, t]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val: TransactionType | 'all') => {
    setType(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder={t('tx.searchPlaceholder')} className="ps-9" />
        </div>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as TransactionType | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TYPE_FILTERS.map((f) => <option key={f.value} value={f.value}>{t(f.labelKey)}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {transactions.length === 0 ? t('tx.emptyNone') : t('tx.emptyFiltered')}
            </p>
          ) : (
            <>
              <div className="divide-y">
                {paginated.map((t) => <TransactionRow key={t.id} transaction={t} />)}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
