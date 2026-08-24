import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { getCashBalance } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT, type TranslationKey } from '@/i18n';
import { categoryKey } from '@/lib/transactionView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

const schema = z.object({
  amount: z.number({ error: 'err.amountRequired' }).positive('err.amountPositive').max(MAX_AMOUNT, 'err.amountTooLarge'),
  date: z.string().min(1, 'err.dateRequired'),
  category: z.enum(['food', 'transport', 'bills', 'shopping', 'health', 'entertainment', 'other']),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ExpenseForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: Expense }) {
  const t = useT();
  const { format } = useCurrency();
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const currentCash = getCashBalance(transactions, openingCash);
  const effectiveCash = editing ? currentCash + editing.amount : currentCash;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { amount: editing.amount, date: editing.date, category: editing.category, notes: editing.notes ?? '' }
      : { date: todayISO(), category: 'food' },
  });

  const amountValue = watch('amount');
  const isInsufficient = Boolean(amountValue && amountValue > effectiveCash);

  const onSubmit = (data: FormValues) => {
    if (data.amount > effectiveCash) {
      toast.error(t('err.insufficientCash', { available: format(effectiveCash), required: format(data.amount) }));
      return;
    }

    const fields = {
      amount: data.amount,
      date: data.date,
      category: data.category as ExpenseCategory,
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success(t('toast.expenseUpdated'));
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'expense', createdAt: nowISO(), ...fields });
      toast.success(t('toast.expenseAdded'));
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="expense-amount">{t('form.amount')}</Label>
          <span className="text-xs text-muted-foreground">Available Cash: {format(effectiveCash)}</span>
        </div>
        <Input id="expense-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{t(errors.amount.message as TranslationKey)}</p>}
        {isInsufficient && !errors.amount && (
          <p className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t('err.insufficientCashInline', { available: format(effectiveCash) })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{t('form.category')}</Label>
        <Select value={watch('category')} onValueChange={(v) => setValue('category', v as ExpenseCategory)}>
          <SelectTrigger><SelectValue placeholder={t('form.selectCategory')} /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{t(categoryKey('expense', c.value))}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-date">{t('form.date')}</Label>
        <Input id="expense-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{t(errors.date.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-notes">{t('form.notesOptional')}</Label>
        <Textarea id="expense-notes" placeholder={t('form.expenseNotesPlaceholder')} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isInsufficient}>{editing ? t('common.saveChanges') : t('add.addExpense')}</Button>
    </form>
  );
}
