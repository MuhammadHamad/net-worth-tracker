import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';

interface NumberPadProps {
  /** Called with the key pressed: '0'-'9', '.', or 'del'. */
  onKey: (key: string) => void;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del'];

/** A native-feeling numeric keypad for fast amount entry on mobile. */
export function NumberPad({ onKey }: NumberPadProps) {
  const t = useT();
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          aria-label={k === 'del' ? t('common.delete') : k}
          className={cn(
            'flex h-14 items-center justify-center rounded-xl bg-secondary text-xl font-semibold text-secondary-foreground transition-transform active:scale-95 active:bg-accent',
          )}
        >
          {k === 'del' ? <Delete className="h-5 w-5" /> : k}
        </button>
      ))}
    </div>
  );
}

/** Apply a keypad key to an amount string, guarding decimals. */
export function applyAmountKey(current: string, key: string): string {
  if (key === 'del') return current.slice(0, -1);
  if (key === '.') {
    if (current.includes('.')) return current;
    return current === '' ? '0.' : current + '.';
  }
  // Limit to 2 decimal places.
  if (current.includes('.') && current.split('.')[1].length >= 2) return current;
  // Avoid leading zeros like "00".
  if (current === '0') return key;
  return current + key;
}
