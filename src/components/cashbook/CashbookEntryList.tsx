import { useState, useMemo } from 'react';
import { Trash2, Edit2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useCashbookStore } from '@/store/useCashbookStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useT } from '@/i18n';
import type { CashbookEntry } from '@/types/cashbook';
import { CashbookEntryForm } from './CashbookEntryForm';

export function CashbookEntryList({ entries }: { entries: CashbookEntry[] }) {
  const t = useT();
  const { format } = useCurrency();
  const deleteEntry = useCashbookStore((s) => s.deleteEntry);
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
              <div key={entry.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {isIncome ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {t(`cashbook.cat.${entry.category}` as never)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.date}</span>
                      {entry.notes && <span>· {entry.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{format(entry.amount)}
                  </span>
                  <div className="flex items-center gap-1">
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
