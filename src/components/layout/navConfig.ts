import { LayoutDashboard, ArrowLeftRight, BookOpen, Wallet, HandCoins, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TranslationKey } from '@/i18n';

export interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transactions', labelKey: 'nav.transactions', icon: ArrowLeftRight },
  { to: '/cashbook', labelKey: 'nav.cashbook', icon: BookOpen },
  { to: '/assets', labelKey: 'nav.assets', icon: Wallet },
  { to: '/loans', labelKey: 'nav.loans', icon: HandCoins },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
