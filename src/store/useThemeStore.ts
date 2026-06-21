import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (t) => { applyTheme(t); set({ theme: t }); },
      toggleTheme: () => { const t = get().theme === 'dark' ? 'light' : 'dark'; applyTheme(t); set({ theme: t }); },
    }),
    {
      name: 'nw_theme',
      onRehydrateStorage: () => (state) => { if (state) applyTheme(state.theme); },
    }
  )
);
