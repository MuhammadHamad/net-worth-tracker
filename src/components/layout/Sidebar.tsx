import { NavLink } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { NAV_ITEMS } from './navConfig';
import { AddTransactionDialog } from '@/components/forms/AddTransactionDialog';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Sidebar() {
  const t = useT();
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:start-0 md:z-40 md:flex md:w-56 md:flex-col border-e bg-card">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-md text-white">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="font-semibold tracking-tight">NetWorth</span>
      </div>

      <div className="px-3 py-4">
        <AddTransactionDialog
          trigger={
            <Button className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" /> {t('common.addEntry')}
            </Button>
          }
        />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3 space-y-2">
        <LogoutButton variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive gap-3" />
        <div className="px-3 text-xs text-muted-foreground">{t('sidebar.privacy')}</div>
      </div>
    </aside>
  );
}
