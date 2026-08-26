import { useState, useMemo } from 'react';
import { Trash2, Edit2, ArrowDownCircle, ArrowUpCircle, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { useCashbookStore } from '@/store/useCashbookStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { getCashBalance } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import { nowISO } from '@/lib/formatters';
import { useT } from '@/i18n';
import type { CashbookEntry } from '@/types/cashbook';
import type { ExpenseCategory, IncomeCategory } from '@/types';
import { CashbookEntryForm } from './CashbookEntryForm';

export function CashbookEntryList({ entries }: { entries: CashbookEntry[] }) {
  const t = useT();
  const { format } = useCurrency();
  const deleteEntry = useCashbookStore((s) => s.deleteEntry);
  const updateEntry = useCashbookStore((s) => s.updateEntry);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [entries]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success(t('cashbook.toastDeleted'));
  };

  const handlePostToNetWorth = (entry: CashbookEntry) => {
    const currentCash = getCashBalance(transactions, openingCash);

    if (entry.type === 'cash_out') {
      if (entry.amount > currentCash) {
        toast.error(t('err.insufficientCash', { available: format(currentCash), required: format(entry.amount) }));
        return;
      }
      const validExpenseCat: ExpenseCategory[] = ['food', 'transport', 'bills', 'shopping', 'health', 'entertainment', 'other'];
      const cat: ExpenseCategory = validExpenseCat.includes(entry.category as ExpenseCategory) ? (entry.category as ExpenseCategory) : 'other';

      addTransaction({
        id: crypto.randomUUID(),
        type: 'expense',
        amount: entry.amount,
        date: entry.date,
        category: cat,
        notes: entry.notes ? `[Cashbook] ${entry.notes}` : `[Cashbook] ${entry.category}`,
        createdAt: nowISO(),
      });
    } else {
      const validIncomeCat: IncomeCategory[] = ['salary', 'business', 'freelance', 'gift', 'other'];
      const cat: IncomeCategory = validIncomeCat.includes(entry.category as IncomeCategory) ? (entry.category as IncomeCategory) : 'other';

      addTransaction({
        id: crypto.randomUUID(),
        type: 'income',
        amount: entry.amount,
        date: entry.date,
        category: cat,
        notes: entry.notes ? `[Cashbook] ${entry.notes}` : `[Cashbook] ${entry.category}`,
        createdAt: nowISO(),
      });
    }

    updateEntry({ ...entry, isPostedToNetWorth: true });
    toast.success(t('toast.postedToNetWorth'));
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          {t('cashbook.emptyNone')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="divide-y">
          {paginated.map((entry) => {
            const isIncome = entry.type === 'cash_in';
            return (
              <div key={entry.id} className="flex items-center justify-between py-3 hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div
                    className={`rounded-full p-2 shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold capitalize text-foreground truncate">
                        {t(`cashbook.cat.${entry.category}` as never)}
                      </p>
                      {entry.isPostedToNetWorth && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                          <Check className="h-3 w-3 mr-0.5" /> Net Worth
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground truncate">
                      <span>{entry.date}</span>
                      {entry.notes && <span>· {entry.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-base font-extrabold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{format(entry.amount)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {!entry.isPostedToNetWorth && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title={t('cashbook.postToNetWorth')}
                        aria-label={t('cashbook.postToNetWorth')}
                        onClick={() => handlePostToNetWorth(entry)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <CashbookEntryForm
                      editing={entry}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sorted.length}
              pageSize={pageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
