import { useState } from 'react';
import type { BorrowedLoan, LentLoan } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { isOverdue } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { LoanDetailDrawer } from './LoanDetailDrawer';

interface LoanRowProps {
  loan: BorrowedLoan | LentLoan;
  /** Label for the settle action (passed through to drawer). */
  settleLabel: string;
}

/**
 * Minimal, scannable loan row.
 * Shows only: name + amount + status indicator.
 * Tap → detail drawer with full info & actions.
 */
export function LoanRow({ loan }: LoanRowProps) {
  const { format } = useCurrency();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLent = loan.type === 'lent';
  const dueDate = isLent ? loan.expectedReturnDate : loan.dueDate;
  const overdue = !loan.isSettled && dueDate ? isOverdue(dueDate) : false;

  const repaid = loan.repaidAmount || 0;
  const remaining = Math.max(0, loan.amount - repaid);
  const hasPartial = repaid > 0 && !loan.isSettled;
  const percentPaid = loan.amount > 0 ? Math.min(100, Math.round((repaid / loan.amount) * 100)) : 0;

  const initial = loan.personOrEntity.charAt(0).toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
          'hover:bg-accent/50 active:scale-[0.98] cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
      >
        {/* Avatar initial */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            loan.isSettled
              ? 'bg-muted text-muted-foreground'
              : isLent
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          )}
        >
          {initial}
        </div>

        {/* Name + optional partial progress */}
        <div className="min-w-0 flex-1">
          <p className={cn(
            'truncate text-sm font-semibold',
            loan.isSettled ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {loan.personOrEntity}
          </p>

          {/* Subtle secondary line — only if there's useful context */}
          {hasPartial ? (
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1 w-16 overflow-hidden rounded-full bg-muted flex-shrink-0">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{percentPaid}%</span>
            </div>
          ) : overdue ? (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[11px] text-destructive font-medium">Overdue</span>
            </div>
          ) : null}
        </div>

        {/* Amount */}
        <span className={cn(
          'shrink-0 text-sm font-bold tabular-nums tracking-tight',
          loan.isSettled
            ? 'text-muted-foreground line-through'
            : isLent
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        )}>
          {format(loan.isSettled ? loan.amount : remaining)}
        </span>

        {/* Chevron hint */}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      </button>

      <LoanDetailDrawer loan={loan} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
