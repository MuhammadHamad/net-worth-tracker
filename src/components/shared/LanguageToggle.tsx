import { Languages } from 'lucide-react';
import { useLangStore, type Lang } from '@/store/useLangStore';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';

const LANGS: { value: Lang; key: 'lang.en' | 'lang.ur' }[] = [
  { value: 'en', key: 'lang.en' },
  { value: 'ur', key: 'lang.ur' },
];

/** Compact segmented English / اردو switcher. */
export function LanguageToggle({ className }: { className?: string }) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full bg-muted p-1', className)}>
      <Languages className="ms-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      {LANGS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => setLang(l.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            lang === l.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(l.key)}
        </button>
      ))}
    </div>
  );
}
