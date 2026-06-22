import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PWAPrompts } from '@/components/pwa/PWAPrompts';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { WelcomeScreen } from '@/components/auth/WelcomeScreen';
import { useThemeStore } from '@/store/useThemeStore';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore, initAuth } from '@/store/useAuthStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { initSync } from '@/lib/sync';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Assets from '@/pages/Assets';
import Loans from '@/pages/Loans';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  // Apply persisted theme on first mount (covers the initial paint after rehydration).
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Start cloud auth + offline-first sync (both no-op unless Supabase is configured).
  useEffect(() => {
    initAuth();
    initSync();
  }, []);

  const ready = useAuthStore((s) => s.ready);
  const user = useAuthStore((s) => s.user);
  const authSkipped = useUiStore((s) => s.authSkipped);

  // Welcome/auth screen only applies when cloud sync is configured. Local-only
  // builds never gate. Wait for the session check so signed-in users don't flash it.
  if (isSupabaseConfigured) {
    if (!ready) return <Splash />;
    if (!user && !authSkipped) return <><WelcomeScreen /><OfflineIndicator /></>;
  }

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <PWAPrompts />
      <OfflineIndicator />
    </>
  );
}

function Splash() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
