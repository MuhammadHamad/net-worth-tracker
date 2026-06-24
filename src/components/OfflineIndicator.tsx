import { useEffect, useRef } from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useT } from '@/i18n';

/**
 * Always-visible "Offline" pill (bottom edge) shown whenever the browser has no
 * connection, plus a one-time "Back online" toast when the connection returns.
 */
export function OfflineIndicator() {
  const t = useT();
  const online = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success(t('offline.backOnline'));
    }
  }, [online, t]);

  if (online) return null;

  return (
    <div className="fixed bottom-20 end-4 z-50 md:bottom-4">
      <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-md">
        <WifiOff className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
        <span>{t('offline.label')}</span>
      </div>
    </div>
  );
}
