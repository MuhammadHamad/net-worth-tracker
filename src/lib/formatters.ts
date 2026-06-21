import type { Currency } from '@/types';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

const LOCALE_MAP: Record<Currency, string> = {
  PKR: 'en-PK', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', AED: 'ar-AE', SAR: 'ar-SA',
};

export function formatCurrency(amount: number, currency: Currency = 'PKR'): string {
  return new Intl.NumberFormat(LOCALE_MAP[currency], { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
export function formatDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
}
export function formatShortDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d'); } catch { return dateStr; }
}
export function isOverdue(dateStr: string): boolean {
  try { return isBefore(parseISO(dateStr), startOfDay(new Date())); } catch { return false; }
}
export function todayISO(): string { return format(new Date(), 'yyyy-MM-dd'); }
export function nowISO(): string { return new Date().toISOString(); }
