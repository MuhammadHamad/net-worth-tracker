import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Transaction, TransactionType } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { TransactionRow } from './TransactionRow';
import { getTransactionView } from '@/lib/transactionView';

const TYPE_FILTERS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'asset', label: 'Asset' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'lent', label: 'Lent' },
];

function searchText(t: Transaction): string {
  const v = getTransactionView(t);
  return `${v.title} ${v.subtitle} ${v.typeLabel}`.toLowerCase();
}

function getDate(t: Transaction): string {
  return 'date' in t ? t.date : t.dateAdded;
}

export function TransactionList() {
  const transactions = useTransactionStore((s) => s.transactions);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => (type === 'all' ? true : t.type === type))
      .filter((t) => (q ? searchText(t).includes(q) : true))
      .sort((a, b) => getDate(b).localeCompare(getDate(a)) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, query, type]);

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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder="Search entries…" className="pl-9" />
        </div>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as TransactionType | 'all')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TYPE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {transactions.length === 0 ? 'No transactions yet.' : 'No entries match your filters.'}
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
