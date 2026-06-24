import { useState } from 'react';
import { CalendarDays, StickyNote, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUiStore } from '@/store/useUiStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES,
  type Income, type Expense, type ExpenseCategory, type IncomeCategory,
} from '@/types';
import { todayISO, nowISO, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { categoryKey } from '@/lib/transactionView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NumberPad, applyAmountKey } from './NumberPad';

type QuickType = 'expense' | 'income';

function displayAmount(amount: string): string {
  if (!amount) return '0';
  const [int, dec] = amount.split('.');
  const grouped = Number(int || '0').toLocaleString('en-US');
  return dec !== undefined ? `${grouped}.${dec}` : grouped;
}

export function QuickAddForm({ onSuccess, onMore }: { onSuccess: () => void; onMore: () => void }) {
  const t = useT();
  const isMobile = useIsMobile();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const { lastExpenseCategory, lastIncomeCategory, setLastExpenseCategory, setLastIncomeCategory } = useUiStore();
  const currency = useProfileStore((s) => s.profile.currency);
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '';

  const [type, setType] = useState<QuickType>('expense');
  const [amount, setAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState<ExpenseCategory>(lastExpenseCategory);
  const [incomeCat, setIncomeCat] = useState<IncomeCategory>(lastIncomeCategory);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCat = type === 'expense' ? expenseCat : incomeCat;
  const amountNum = parseFloat(amount) || 0;
  const canSave = amountNum > 0;
  const isToday = date === todayISO();

  const onSave = () => {
    if (!canSave) return;
    const base = { id: crypto.randomUUID(), amount: amountNum, date, notes: note.trim() || undefined, createdAt: nowISO() };
    if (type === 'expense') {
      addTransaction({ ...base, type: 'expense', category: expenseCat } as Expense);
      setLastExpenseCategory(expenseCat);
      toast.success(t('toast.expenseAdded'));
    } else {
      addTransaction({ ...base, type: 'income', category: incomeCat } as Income);
      setLastIncomeCategory(incomeCat);
      toast.success(t('toast.incomeAdded'));
    }
    onSuccess();
  };

  // ── Pinned top: type selector + amount ──────────────────────────────────────
  const header = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(['expense', 'income'] as const).map((qt) => (
            <button
              key={qt}
              type="button"
              onClick={() => setType(qt)}
              className={cn(
                'rounded-md py-2 text-sm font-medium transition-colors',
                type === qt ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {qt === 'expense' ? t('common.expense') : t('common.income')}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
        >
          <Landmark className="h-4 w-4" /> {t('add.assetLoan')}
        </button>
      </div>

      {isMobile ? (
        <div className="text-center">
          <div className={cn('text-4xl font-bold tracking-tight', type === 'expense' ? 'text-destructive' : 'text-[hsl(var(--success))]')}>
            <span className="me-1 text-xl text-muted-foreground">{symbol}</span>
            {displayAmount(amount)}
          </div>
        </div>
      ) : (
        <div className="relative">
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">{symbol}</span>
          <Input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
            placeholder="0"
            className={cn('h-14 ps-9 text-2xl font-bold', type === 'expense' ? 'text-destructive' : 'text-[hsl(var(--success))]')}
          />
        </div>
      )}
    </div>
  );

  // ── Scrollable middle: categories + date/note ──────────────────────────────
  const middle = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => {
          const active = c.value === selectedCat;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => (type === 'expense' ? setExpenseCat(c.value as ExpenseCategory) : setIncomeCat(c.value as IncomeCategory))}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors active:scale-95',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background text-muted-foreground hover:bg-accent'
              )}
            >
              {t(categoryKey(type, c.value))}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowDate((v) => !v)}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium', showDate ? 'border-primary text-primary' : 'border-input text-muted-foreground')}
        >
          <CalendarDays className="h-3.5 w-3.5" /> {isToday ? t('common.today') : formatDate(date)}
        </button>
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium', showNote || note ? 'border-primary text-primary' : 'border-input text-muted-foreground')}
        >
          <StickyNote className="h-3.5 w-3.5" /> {note ? t('quick.noteAdded') : t('quick.addNote')}
        </button>
      </div>
      {showDate && <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
      {showNote && <Textarea placeholder={t('quick.notePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />}
    </div>
  );

  // ── Pinned footer: keypad (mobile) + Add button — always visible ───────────
  const footer = (
    <div className="space-y-3">
      {isMobile && <NumberPad onKey={(k) => setAmount((a) => applyAmountKey(a, k))} />}
      <Button onClick={onSave} disabled={!canSave} className="h-12 w-full text-base">
        {type === 'expense' ? t('add.addExpense') : t('add.addIncome')}
      </Button>
    </div>
  );

  if (isMobile) {
    // Fixed header + footer, scrollable middle, so the Add button never scrolls away.
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0">{header}</div>
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 py-3">{middle}</div>
        <div className="shrink-0 pt-1">{footer}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      {middle}
      {footer}
    </div>
  );
}
