import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['food', 'transport', 'bills', 'shopping', 'health', 'entertainment', 'other']),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { date: todayISO(), category: 'food' },
  });

  const onSubmit = (data: FormValues) => {
    const entry: Expense = {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: data.amount,
      date: data.date,
      category: data.category as ExpenseCategory,
      notes: data.notes?.trim() || undefined,
      createdAt: nowISO(),
    };
    addTransaction(entry);
    toast.success('Expense added');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="expense-amount">Amount</Label>
        <Input id="expense-amount" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={watch('category')} onValueChange={(v) => setValue('category', v as ExpenseCategory)}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-date">Date</Label>
        <Input id="expense-date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-notes">Notes (optional)</Label>
        <Textarea id="expense-notes" placeholder="e.g. Groceries" {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">Add Expense</Button>
    </form>
  );
}
