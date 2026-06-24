import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'en' | 'ur';

/** Languages that read right-to-left. */
const RTL_LANGS: Lang[] = ['ur'];

export function isRtl(lang: Lang): boolean {
  return RTL_LANGS.includes(lang);
}

/** Reflect the active language onto <html lang> + <html dir> so the browser flips
 * text direction and logical CSS utilities (ms-/me-/ps-/pe-/start-/end-) follow. */
export function applyLang(lang: Lang) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = isRtl(lang) ? 'rtl' : 'ltr';
}

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'en', // English is the default.
      setLang: (lang) => { applyLang(lang); set({ lang }); },
    }),
    {
      name: 'nw_lang',
      onRehydrateStorage: () => (state) => { if (state) applyLang(state.lang); },
    }
  )
);
