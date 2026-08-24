import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, X } from 'lucide-react';
import { useT } from '@/i18n';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const isSettings = location.pathname === '/settings';

  const handleToggleSettings = () => {
    if (isSettings) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } else {
      navigate('/settings');
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        {/* Mobile Settings / Close Toggle Button */}
        <button
          type="button"
          onClick={handleToggleSettings}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs"
          aria-label={isSettings ? t('common.close') || 'Close' : t('nav.settings')}
        >
          {isSettings ? <X className="h-5 w-5 text-foreground" /> : <Settings className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
