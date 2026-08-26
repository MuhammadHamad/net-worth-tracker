import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertTriangle, Banknote } from 'lucide-react';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { getCashBalance } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import { useT, type TranslationKey } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RepayLoanDialogProps {
  loan: BorrowedLoan | LentLoan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepayLoanDialog({ loan, open, onOpenChange }: RepayLoanDialogProps) {
  const t = useT();
  const { format } = useCurrency();
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const transactions = useTransactionStore((s) => s.transactions);
  const openingCash = useProfileStore((s) => s.profile.openingCash);

  const currentCash = getCashBalance(transactions, openingCash);
  const remaining = Math.max(0, loan.amount - (loan.repaidAmount || 0));

  const isBorrowed = loan.type === 'borrowed';

  const schema = z.object({
    installmentAmount: z
      .number({ error: 'err.amountRequired' })
      .positive('err.amountPositive')
      .max(remaining, 'err.amountTooLarge'),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { installmentAmount: remaining },
  });

  const installmentVal = watch('installmentAmount');
  const isInsufficientCash = Boolean(isBorrowed && installmentVal && installmentVal > currentCash);

  const onSubmit = (data: FormValues) => {
    if (isBorrowed && data.installmentAmount > currentCash) {
      toast.error(t('err.insufficientCash', { available: format(currentCash), required: format(data.installmentAmount) }));
      return;
    }

    const newRepaid = (loan.repaidAmount || 0) + data.installmentAmount;
    const newIsSettled = newRepaid >= loan.amount - 0.01;

    updateTransaction({
      ...loan,
      repaidAmount: newRepaid,
      isSettled: newIsSettled,
    });

    toast.success(t('loans.markedSettled'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            {isBorrowed ? t('loans.repayTitle') : t('loans.receiveTitle')}
          </DialogTitle>
          <DialogDescription>
            {loan.personOrEntity} · {t('loans.remaining', { amount: format(remaining) })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4 pt-2">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Total Principal:</span>
              <span className="font-semibold text-foreground">{format(loan.amount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Already Repaid:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{format(loan.repaidAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-bold border-t pt-1 mt-1">
              <span className="text-foreground">Remaining Balance:</span>
              <span className="text-primary">{format(remaining)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="installmentAmount">{t('loans.installmentAmount')}</Label>
              {isBorrowed && (
                <span className="text-xs text-muted-foreground">Available Cash: {format(currentCash)}</span>
              )}
            </div>
            <Input
              id="installmentAmount"
              type="number"
              step="any"
              max={remaining}
              placeholder="0.00"
              {...register('installmentAmount', { valueAsNumber: true })}
            />
            {errors.installmentAmount && (
              <p className="text-xs text-destructive">{t(errors.installmentAmount.message as TranslationKey)}</p>
            )}
            {isInsufficientCash && !errors.installmentAmount && (
              <p className="text-xs font-semibold text-destructive flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t('err.insufficientCashInline', { available: format(currentCash) })}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isInsufficientCash}>
            {isBorrowed ? t('loans.repay') : t('loans.receive')} {installmentVal ? format(installmentVal) : ''}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
