-- NetWorth Tracker — cloud sync schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
--
-- One generic, user-scoped table holds every synced record as a JSONB blob with
-- last-write-wins metadata. Row Level Security ensures a user can only ever see
-- or touch their own rows.

create table if not exists public.sync_items (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  kind       text        not null check (kind in ('transaction', 'snapshot', 'profile', 'cashbook')),
  item_id    text        not null,
  data       jsonb       not null,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

-- Migration for existing databases: update check constraint to include cashbook
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'sync_items_kind_check'
  ) then
    alter table public.sync_items drop constraint sync_items_kind_check;
    alter table public.sync_items add constraint sync_items_kind_check check (kind in ('transaction', 'snapshot', 'profile', 'cashbook'));
  end if;
end $$;

-- Pull queries filter by (user_id, updated_at) — index it.
create index if not exists sync_items_user_updated_idx
  on public.sync_items (user_id, updated_at);

alter table public.sync_items enable row level security;

-- A user may only read/insert/update/delete their own rows.
drop policy if exists "own rows: select" on public.sync_items;
create policy "own rows: select" on public.sync_items
  for select using (auth.uid() = user_id);

drop policy if exists "own rows: insert" on public.sync_items;
create policy "own rows: insert" on public.sync_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "own rows: update" on public.sync_items;
create policy "own rows: update" on public.sync_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows: delete" on public.sync_items;
create policy "own rows: delete" on public.sync_items
  for delete using (auth.uid() = user_id);
