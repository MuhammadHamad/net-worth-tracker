import { useCallback } from 'react';
import { useLangStore, type Lang } from '@/store/useLangStore';
import { translations, en, type TranslationKey } from './translations';

export type { TranslationKey } from './translations';
export type TParams = Record<string, string | number>;

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

/** Translate a key for a given language, falling back to English then the key itself. */
export function translate(lang: Lang, key: TranslationKey, params?: TParams): string {
  const dict = translations[lang] as Record<TranslationKey, string>;
  const template = dict[key] ?? en[key] ?? key;
  return interpolate(template, params);
}

/** Non-hook translator for class components and module-scope helpers. Reads the live store. */
export function tRaw(key: TranslationKey, params?: TParams): string {
  return translate(useLangStore.getState().lang, key, params);
}

export type TFn = (key: TranslationKey, params?: TParams) => string;

/** React hook: returns a `t` bound to the active language; re-renders on language change. */
export function useT(): TFn {
  const lang = useLangStore((s) => s.lang);
  return useCallback((key: TranslationKey, params?: TParams) => translate(lang, key, params), [lang]);
}
