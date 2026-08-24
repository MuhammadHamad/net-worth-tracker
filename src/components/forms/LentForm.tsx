import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { getCashBalance } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import type { LentLoan } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT, type TranslationKey } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

const schema = z.object({
  personOrEntity: z.string().min(1, 'err.nameRequired'),
  amount: z.number({ error: 'err.amountRequired' }).positive('err.amountPositive').max(MAX_AMOUNT, 'err.amountTooLarge'),
  date: z.string().min(1, 'err.dateRequired'),
  expectedReturnDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function LentForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: LentLoan }) {
  const t = useT();
  const { format } = useCurrency();
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const currentCash = getCashBalance(transactions, openingCash);
  const effectiveCash = editing && !editing.isSettled ? currentCash + editing.amount : currentCash;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { personOrEntity: editing.personOrEntity, amount: editing.amount, date: editing.date, expectedReturnDate: editing.expectedReturnDate ?? '', notes: editing.notes ?? '' }
      : { date: todayISO() },
  });

  const amountValue = watch('amount');
  const isInsufficient = Boolean(amountValue && amountValue > effectiveCash);

  const onSubmit = (data: FormValues) => {
    if (data.amount > effectiveCash) {
      toast.error(t('err.insufficientCash', { available: format(effectiveCash), required: format(data.amount) }));
      return;
    }

    const fields = {
      personOrEntity: data.personOrEntity.trim(),
      amount: data.amount,
      date: data.date,
      expectedReturnDate: data.expectedReturnDate || undefined,
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success(t('toast.loanUpdated'));
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'lent', isSettled: false, createdAt: nowISO(), ...fields });
      toast.success(t('toast.lentAdded'));
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="lent-person">{t('form.lentTo')}</Label>
        <Input id="lent-person" placeholder={t('form.lentPersonPlaceholder')} {...register('personOrEntity')} />
        {errors.personOrEntity && <p className="text-xs text-destructive">{t(errors.personOrEntity.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="lent-amount">{t('form.amount')}</Label>
          <span className="text-xs text-muted-foreground">Available Cash: {format(effectiveCash)}</span>
        </div>
        <Input id="lent-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{t(errors.amount.message as TranslationKey)}</p>}
        {isInsufficient && !errors.amount && (
          <p className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t('err.insufficientCashInline', { available: format(effectiveCash) })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lent-date">{t('form.dateLent')}</Label>
        <Input id="lent-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{t(errors.date.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lent-return">{t('form.expectedReturnOptional')}</Label>
        <Input id="lent-return" type="date" {...register('expectedReturnDate')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lent-notes">{t('form.notesOptional')}</Label>
        <Textarea id="lent-notes" placeholder={t('form.detailsPlaceholder')} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isInsufficient}>{editing ? t('common.saveChanges') : t('add.addLent')}</Button>
    </form>
  );
}
