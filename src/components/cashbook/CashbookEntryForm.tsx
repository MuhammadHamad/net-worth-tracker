import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCashbookStore } from '@/store/useCashbookStore';
import type { CashbookEntry, CashbookCategory, CashbookEntryType } from '@/types/cashbook';
import { CASHBOOK_CATEGORIES } from '@/types/cashbook';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const schema = z.object({
  type: z.enum(['cash_in', 'cash_out']),
  amount: z.number({ error: 'err.amountRequired' }).positive('err.amountPositive').max(MAX_AMOUNT, 'err.amountTooLarge'),
  category: z.enum(['food', 'transport', 'bills', 'shopping', 'groceries', 'health', 'entertainment', 'weekly', 'salary', 'freelance', 'business', 'gift', 'other']),
  date: z.string().min(1, 'err.dateRequired'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CashbookEntryForm({
  editing,
  onSuccess,
  trigger,
}: {
  editing?: CashbookEntry;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const addEntry = useCashbookStore((s) => s.addEntry);
  const updateEntry = useCashbookStore((s) => s.updateEntry);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { type: editing.type, amount: editing.amount, category: editing.category, date: editing.date, notes: editing.notes ?? '' }
      : { type: 'cash_out', date: todayISO(), category: 'food' },
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');

  const onSubmit = (data: FormValues) => {
    const fields = {
      type: data.type as CashbookEntryType,
      amount: data.amount,
      category: data.category as CashbookCategory,
      date: data.date,
      notes: data.notes?.trim() || undefined,
    };

    if (editing) {
      updateEntry({ ...editing, ...fields });
      toast.success(t('cashbook.toastUpdated'));
    } else {
      addEntry({ id: crypto.randomUUID(), createdAt: nowISO(), ...fields });
      toast.success(t('cashbook.toastAdded'));
    }

    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> {t('cashbook.addEntry')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? t('cashbook.editEntry') : t('cashbook.addEntry')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setValue('type', 'cash_out')}
              className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                selectedType === 'cash_out' ? 'bg-destructive text-destructive-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.cashOut')} (Expense)
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'cash_in')}
              className={`rounded-md py-1.5 text-xs font-semibold transition-all ${
                selectedType === 'cash_in' ? 'bg-[hsl(var(--success))] text-white shadow-xs' : 'text-muted-foreground'
              }`}
            >
              {t('cashbook.cashIn')} (Income)
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">{t('form.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>{t('form.category')}</Label>
            <Select value={selectedCategory} onValueChange={(val) => setValue('category', val as CashbookCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASHBOOK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {t(cat.labelKey as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date">{t('form.date')}</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">{t('form.notesOptional')}</Label>
            <Textarea id="notes" placeholder="Optional description..." rows={2} {...register('notes')} />
          </div>

          <Button type="submit" className="w-full">
            {editing ? t('common.saveChanges') : t('common.addEntry')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
