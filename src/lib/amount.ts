// A ceiling well beyond any real personal-finance figure. Guards against overflow to
// Infinity and against magnitudes that break Intl formatting or floating-point math.
export const MAX_AMOUNT = 1e15;

/** True for a real, positive, in-range money amount (rejects NaN, Infinity, ≤0, absurd). */
export function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n > 0 && n <= MAX_AMOUNT;
}

/**
 * Coerce arbitrary user/text input into a valid money amount, or `null` if it can't be.
 * Use this on every write path so a NaN/Infinity value can never enter the store and
 * poison every total (`sum + NaN === NaN`).
 */
export function sanitizeAmount(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return isValidAmount(n) ? n : null;
}
