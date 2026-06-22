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

## Optional cloud sync (Supabase)

The app is **local-first** and works with no backend. Cloud sync is opt-in: it adds
cross-device backup via passwordless magic-link sign-in, and only appears once configured.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) (creates the
   `sync_items` table + row-level-security so each user only sees their own data).
3. In **Project Settings → API**, copy the **Project URL** and **anon public** key.
4. `cp .env.example .env.local` and paste both values:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. Restart `npm run dev`. A **Cloud Sync** card appears in Settings.

Sync is **offline-first**: `localStorage` stays the source of truth, changes push in the
background and pull on reconnect, with last-write-wins conflict resolution. The `anon` key is
the public client key (safe to ship); never commit the `service_role` key.

## Features

- **Dashboard** — net worth hero card, 5 summary metrics, money-flow & net-worth-history charts, recent activity.
- **Transactions** — searchable, type-filterable list with delete confirmation.
- **Assets** — grid of what you own, by category.
- **Loans** — money owed to you vs money you owe, with overdue badges and one-tap settle.
- **Settings** — name, currency (drives all formatting), and dark mode.
- **PWA** — installable, theme-colored, offline-capable.

All data is private and on-device.
