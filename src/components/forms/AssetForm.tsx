import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { ASSET_CATEGORIES, type Asset, type AssetCategory } from '@/types';
import { todayISO, nowISO } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  estimatedValue: z.number({ error: 'Value is required' }).positive('Value must be positive'),
  category: z.enum(['vehicle', 'real_estate', 'precious_metals', 'investments', 'savings', 'other']),
  dateAdded: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AssetForm({ onSuccess, editing }: { onSuccess?: () => void; editing?: Asset }) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editing
      ? { name: editing.name, estimatedValue: editing.estimatedValue, category: editing.category, dateAdded: editing.dateAdded, notes: editing.notes ?? '' }
      : { dateAdded: todayISO(), category: 'savings' },
  });

  const onSubmit = (data: FormValues) => {
    const fields = {
      name: data.name.trim(),
      estimatedValue: data.estimatedValue,
      category: data.category as AssetCategory,
      dateAdded: data.dateAdded,
      notes: data.notes?.trim() || undefined,
    };
    if (editing) {
      updateTransaction({ ...editing, ...fields });
      toast.success('Asset updated');
    } else {
      addTransaction({ id: crypto.randomUUID(), type: 'asset', createdAt: nowISO(), ...fields });
      toast.success('Asset added');
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="asset-name">Name</Label>
        <Input id="asset-name" placeholder="e.g. Honda 125, Gold ring" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-value">Estimated Value</Label>
        <Input id="asset-value" type="number" step="0.01" inputMode="decimal" placeholder="0" {...register('estimatedValue', { valueAsNumber: true })} />
        {errors.estimatedValue && <p className="text-xs text-destructive">{errors.estimatedValue.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={watch('category')} onValueChange={(v) => setValue('category', v as AssetCategory)}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {ASSET_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-date">Date Added</Label>
        <Input id="asset-date" type="date" {...register('dateAdded')} />
        {errors.dateAdded && <p className="text-xs text-destructive">{errors.dateAdded.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-notes">Notes (optional)</Label>
        <Textarea id="asset-notes" placeholder="Details" {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">{editing ? 'Save Changes' : 'Add Asset'}</Button>
    </form>
  );
}
