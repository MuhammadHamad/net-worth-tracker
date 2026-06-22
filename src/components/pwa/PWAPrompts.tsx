import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Two unobtrusive PWA prompts:
 *  - "Update available" toast when a new service worker is waiting.
 *  - "Install app" banner when the browser offers installation.
 */
export function PWAPrompts() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const showInstall = installEvent && !installDismissed;

  if (!needRefresh && !showInstall) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-4 md:left-56">
      {needRefresh && (
        <div className="flex w-full max-w-md items-center gap-3 rounded-lg border bg-card p-3 shadow-lg">
          <RefreshCw className="h-5 w-5 shrink-0 text-primary" />
          <span className="flex-1 text-sm">A new version is available.</span>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>Reload</Button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Dismiss" onClick={() => setNeedRefresh(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {showInstall && (
        <div className="flex w-full max-w-md items-center gap-3 rounded-lg border bg-card p-3 shadow-lg">
          <Download className="h-5 w-5 shrink-0 text-primary" />
          <span className="flex-1 text-sm">Install NetWorth for one-tap access.</span>
          <Button size="sm" onClick={() => void onInstall()}>Install</Button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Dismiss" onClick={() => setInstallDismissed(true)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
