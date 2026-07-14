import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import type { BorrowedLoan } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT, type TranslationKey } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  personOrEntity: z.string().min(1, 'err.nameRequired'),
  amount: z.number({ error: 'err.amountRequired' }).positive('err.amountPositive').max(MAX_AMOUNT, 'err.amountTooLarge'),
  date: z.string().min(1, 'err.dateRequired'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function BorrowedForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: BorrowedLoan }) {
  const t = useT();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { personOrEntity: editing.personOrEntity, amount: editing.amount, date: editing.date, dueDate: editing.dueDate ?? '', notes: editing.notes ?? '' }
      : { date: todayISO() },
  });

  const onSubmit = (data: FormValues) => {
    const fields = {
      personOrEntity: data.personOrEntity.trim(),
      amount: data.amount,
      date: data.date,
      dueDate: data.dueDate || undefined,
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success(t('toast.loanUpdated'));
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'borrowed', isSettled: false, createdAt: nowISO(), ...fields });
      toast.success(t('toast.borrowedAdded'));
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="borrowed-person">{t('form.borrowedFrom')}</Label>
        <Input id="borrowed-person" placeholder={t('form.borrowedPersonPlaceholder')} {...register('personOrEntity')} />
        {errors.personOrEntity && <p className="text-xs text-destructive">{t(errors.personOrEntity.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-amount">{t('form.amount')}</Label>
        <Input id="borrowed-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{t(errors.amount.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-date">{t('form.dateBorrowed')}</Label>
        <Input id="borrowed-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{t(errors.date.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-due">{t('form.dueDateOptional')}</Label>
        <Input id="borrowed-due" type="date" {...register('dueDate')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-notes">{t('form.notesOptional')}</Label>
        <Textarea id="borrowed-notes" placeholder={t('form.detailsPlaceholder')} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">{editing ? t('common.saveChanges') : t('add.addBorrowed')}</Button>
    </form>
  );
}
