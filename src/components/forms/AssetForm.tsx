import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { ASSET_CATEGORIES, type Asset, type AssetCategory } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { MAX_AMOUNT } from '@/lib/amount';
import { useT, type TranslationKey } from '@/i18n';
import { categoryKey } from '@/lib/transactionView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(1, 'err.nameRequired'),
  estimatedValue: z.number({ error: 'err.valueRequired' }).positive('err.valuePositive').max(MAX_AMOUNT, 'err.valueTooLarge'),
  category: z.enum(['vehicle', 'real_estate', 'precious_metals', 'investments', 'savings', 'other']),
  dateAdded: z.string().min(1, 'err.dateRequired'),
  isPaidFromCash: z.boolean().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AssetForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: Asset }) {
  const t = useT();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { name: editing.name, estimatedValue: editing.estimatedValue, category: editing.category, dateAdded: editing.dateAdded, isPaidFromCash: Boolean(editing.isPaidFromCash), notes: editing.notes ?? '' }
      : { dateAdded: todayISO(), category: 'savings', isPaidFromCash: false },
  });

  const onSubmit = (data: FormValues) => {
    const fields = {
      name: data.name.trim(),
      estimatedValue: data.estimatedValue,
      category: data.category as AssetCategory,
      dateAdded: data.dateAdded,
      isPaidFromCash: Boolean(data.isPaidFromCash),
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success(t('toast.assetUpdated'));
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'asset', createdAt: nowISO(), ...fields });
      toast.success(t('toast.assetAdded'));
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="asset-name">{t('form.name')}</Label>
        <Input id="asset-name" placeholder={t('form.assetNamePlaceholder')} {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{t(errors.name.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-value">{t('form.estimatedValue')}</Label>
        <Input id="asset-value" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('estimatedValue', { valueAsNumber: true })} />
        {errors.estimatedValue && <p className="text-xs text-destructive">{t(errors.estimatedValue.message as TranslationKey)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{t('form.category')}</Label>
        <Select value={watch('category')} onValueChange={(v) => setValue('category', v as AssetCategory)}>
          <SelectTrigger><SelectValue placeholder={t('form.selectCategory')} /></SelectTrigger>
          <SelectContent>
            {ASSET_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{t(categoryKey('asset', c.value))}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-date">{t('form.dateAdded')}</Label>
        <Input id="asset-date" type="date" {...register('dateAdded')} />
        {errors.dateAdded && <p className="text-xs text-destructive">{t(errors.dateAdded.message as TranslationKey)}</p>}
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border p-3 bg-muted/30">
        <input
          type="checkbox"
          id="isPaidFromCash"
          className="mt-0.5 h-4 w-4 rounded border-input text-primary accent-primary"
          {...register('isPaidFromCash')}
        />
        <div className="space-y-0.5">
          <Label htmlFor="isPaidFromCash" className="cursor-pointer text-sm font-medium">
            Deduct from cash balance
          </Label>
          <p className="text-xs text-muted-foreground">
            Subtracts this asset's estimated value from your cash balance.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-notes">{t('form.notesOptional')}</Label>
        <Textarea id="asset-notes" placeholder={t('form.detailsPlaceholder')} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">{editing ? t('common.saveChanges') : t('add.addAsset')}</Button>
    </form>
  );
}
