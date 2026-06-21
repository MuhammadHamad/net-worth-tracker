import { LayoutDashboard, ArrowLeftRight, Wallet, HandCoins, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/assets', label: 'Assets', icon: Wallet },
  { to: '/loans', label: 'Loans', icon: HandCoins },
  { to: '/settings', label: 'Settings', icon: Settings },
];
