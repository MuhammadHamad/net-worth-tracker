import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/persistStorage';

export type Mode = 'light' | 'dark';
export type Palette = 'classic' | 'aurora';

interface ThemeStore {
  mode: Mode;
  palette: Palette;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  setPalette: (p: Palette) => void;
}

export function applyAppearance(mode: Mode, palette: Palette) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.setAttribute('data-theme', palette);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'light',
      palette: 'classic',
      setMode: (m) => { applyAppearance(m, get().palette); set({ mode: m }); },
      toggleMode: () => { const m: Mode = get().mode === 'dark' ? 'light' : 'dark'; applyAppearance(m, get().palette); set({ mode: m }); },
      setPalette: (p) => { applyAppearance(get().mode, p); set({ palette: p }); },
    }),
    {
      name: 'nw_theme',
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      // Migrate the old { theme: 'light' | 'dark' } shape into { mode, palette }.
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as { theme?: Mode; mode?: Mode; palette?: Palette };
        return { mode: p.mode ?? p.theme ?? 'light', palette: p.palette ?? 'classic' };
      },
      onRehydrateStorage: () => (state) => { if (state) applyAppearance(state.mode, state.palette); },
    }
  )
);
