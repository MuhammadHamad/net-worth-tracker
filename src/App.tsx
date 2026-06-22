import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PWAPrompts } from '@/components/pwa/PWAPrompts';
import { useThemeStore } from '@/store/useThemeStore';
import { initAuth } from '@/store/useAuthStore';
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
    </>
  );
}
