import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import type { BorrowedLoan } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  personOrEntity: z.string().min(1, 'Name is required'),
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function BorrowedForm({ onSuccess }: { onSuccess?: () => void }) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { date: todayISO() },
  });

  const onSubmit = (data: FormValues) => {
    const entry: BorrowedLoan = {
      id: crypto.randomUUID(),
      type: 'borrowed',
      personOrEntity: data.personOrEntity.trim(),
      amount: data.amount,
      date: data.date,
      dueDate: data.dueDate || undefined,
      notes: data.notes?.trim() || undefined,
      isSettled: false,
      createdAt: nowISO(),
    };
    addTransaction(entry);
    toast.success('Borrowed loan added');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="borrowed-person">Borrowed From</Label>
        <Input id="borrowed-person" placeholder="e.g. Ahmed, Bank" {...register('personOrEntity')} />
        {errors.personOrEntity && <p className="text-xs text-destructive">{errors.personOrEntity.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-amount">Amount</Label>
        <Input id="borrowed-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-date">Date Borrowed</Label>
        <Input id="borrowed-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-due">Due Date (optional)</Label>
        <Input id="borrowed-due" type="date" {...register('dueDate')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="borrowed-notes">Notes (optional)</Label>
        <Textarea id="borrowed-notes" placeholder="Details" {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">Add Borrowed Loan</Button>
    </form>
  );
}
