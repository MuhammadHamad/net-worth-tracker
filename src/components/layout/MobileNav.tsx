import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navConfig';
import { AddTransactionDialog } from '@/components/forms/AddTransactionDialog';

export function MobileNav() {
  // Split nav items around a central Add button: first two on the left, last two on the right.
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around">
        {left.map((item) => <MobileNavItem key={item.to} {...item} />)}

        <AddTransactionDialog
          trigger={
            <button
              type="button"
              className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-90"
              aria-label="Add entry"
            >
              <Plus className="h-6 w-6" />
            </button>
          }
        />

        {right.map((item) => <MobileNavItem key={item.to} {...item} />)}
      </div>
    </nav>
  );
}

function MobileNavItem({ to, label, icon: Icon }: (typeof NAV_ITEMS)[number]) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-transform active:scale-90',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}
