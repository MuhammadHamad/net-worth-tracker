import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { getCashBalance } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import { INCOME_CATEGORIES, type Income, type IncomeCategory } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT, type TranslationKey } from '@/i18n';
import { categoryKey } from '@/lib/transactionView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Validation messages are translation keys, resolved with `t` at render time.
const schema = z.object({
  amount: z.number({ error: 'err.amountRequired' }).positive('err.amountPositive').max(MAX_AMOUNT, 'err.amountTooLarge'),
  date: z.string().min(1, 'err.dateRequired'),
  category: z.enum(['salary', 'business', 'freelance', 'gift', 'other']),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function IncomeForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: Income }) {
  const t = useT();
  const { format } = useCurrency();
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const currentCash = getCashBalance(transactions, openingCash);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { amount: editing.amount, date: editing.date, category: editing.category, notes: editing.notes ?? '' }
      : { date: todayISO(), category: 'salary' },
  });

  const amountValue = watch('amount');
  const projectedCash = editing && amountValue ? currentCash - editing.amount + amountValue : currentCash;
  const isEditingInsufficient = Boolean(editing && amountValue && projectedCash < 0);

  const onSubmit = (data: FormValues) => {
    if (editing) {
      const projected = currentCash - editing.amount + data.amount;
      if (projected < 0) {
        toast.error(t('err.negativeIncomeCash', { deficit: format(Math.abs(projected)) }));
        return;
      }
    }

    const fields = {
      amount: data.amount,
      date: data.date,
      category: data.category as IncomeCategory,
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success(t('toast.incomeUpdated'));
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'income', createdAt: nowISO(), ...fields });
      toast.success(t('toast.incomeAdded'));
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="income-amount">{t('form.amount')}</Label>
        <Input id="income-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{t(errors.amount.message as TranslationKey)}</p>}
        {isEditingInsufficient && !errors.amount && (
          <p className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t('err.negativeIncomeCash', { deficit: format(Math.abs(projectedCash)) })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{t('form.category')}</Label>
        <Select value={watch('category')} onValueChange={(v) => setValue('category', v as IncomeCategory)}>
          <SelectTrigger><SelectValue placeholder={t('form.selectCategory')} /></SelectTrigger>
          <SelectContent>
            {INCOME_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{t(categoryKey('income', c.value))}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="income-date">{t('form.date')}</Label>
        <Input id="income-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{t(errors.date.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="income-notes">{t('form.notesOptional')}</Label>
        <Textarea id="income-notes" placeholder={t('form.incomeNotesPlaceholder')} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isEditingInsufficient}>{editing ? t('common.saveChanges') : t('add.addIncome')}</Button>
    </form>
  );
}
