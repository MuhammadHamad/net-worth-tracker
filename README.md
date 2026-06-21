# NetWorth Tracker

A privacy-first, offline-first **Personal Net Worth Tracking PWA**. Open it and know your exact
financial position in seconds — net worth, assets, liabilities, cash, income/expenses, and informal
loans (money lent to / borrowed from people) — all in one glance.

Everything stays on your device in `localStorage`. No accounts, no servers, works fully offline.

## Net worth model

```
cashBalance = totalIncome − totalExpenses
netWorth    = totalAssets + totalLent(unsettled) + cashBalance − totalBorrowed(unsettled)
```

## Tech stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · Radix UI primitives ·
Zustand (persisted to localStorage) · React Hook Form + Zod v4 · Recharts · vaul · React Router v7 ·
Sonner · date-fns · Lucide.

## Getting started

> Requires **Node 20.19+ / 22.12+** (Vite 8). If you use nvm: `nvm use 22`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Features

- **Dashboard** — net worth hero card, 5 summary metrics, money-flow & net-worth-history charts, recent activity.
- **Transactions** — searchable, type-filterable list with delete confirmation.
- **Assets** — grid of what you own, by category.
- **Loans** — money owed to you vs money you owe, with overdue badges and one-tap settle.
- **Settings** — name, currency (drives all formatting), and dark mode.
- **PWA** — installable, theme-colored, offline-capable.

All data is private and on-device.
