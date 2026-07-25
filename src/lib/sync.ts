import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStore } from '@/store/useSyncStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { validateTransaction, validateSnapshot, validateProfile } from '@/lib/schemas';
import type { Transaction, NetWorthSnapshot, UserProfile } from '@/types';

export type Kind = 'transaction' | 'snapshot' | 'profile';

interface LocalItem { kind: Kind; item_id: string; data: unknown; deleted: boolean; updatedAt: string }
export interface RemoteRow { kind: Kind; item_id: string; data: Record<string, unknown>; deleted: boolean; updated_at: string }

const EPOCH = '1970-01-01T00:00:00.000Z';
const PROFILE_ID = 'me';

const txClock = (t: Transaction) => t.updatedAt ?? t.createdAt ?? EPOCH;
const snapClock = (s: NetWorthSnapshot) => s.updatedAt ?? `${s.date}T00:00:00.000Z`;

// ---- gather local state as sync items ---------------------------------------

function collectLocal(): LocalItem[] {
  const { transactions, tombstones } = useTransactionStore.getState();
  const { snapshots } = useSnapshotStore.getState();
  const { profile } = useProfileStore.getState();

  const items: LocalItem[] = [];
  for (const t of transactions) items.push({ kind: 'transaction', item_id: t.id, data: t, deleted: false, updatedAt: txClock(t) });
  for (const [id, at] of Object.entries(tombstones)) items.push({ kind: 'transaction', item_id: id, data: {}, deleted: true, updatedAt: at });
  for (const s of snapshots) items.push({ kind: 'snapshot', item_id: s.date, data: s, deleted: false, updatedAt: snapClock(s) });
  if (profile.updatedAt) items.push({ kind: 'profile', item_id: PROFILE_ID, data: profile, deleted: false, updatedAt: profile.updatedAt });
  return items;
}

// ---- apply remote rows into local stores (last-write-wins) ------------------

export function applyRemote(rows: RemoteRow[]) {
  if (rows.length === 0) return;

  const txStore = useTransactionStore.getState();
  const byId = new Map(txStore.transactions.map((t) => [t.id, t]));
  const tombstones = { ...txStore.tombstones };
  let txChanged = false;

  const snapStore = useSnapshotStore.getState();
  const snapByDate = new Map(snapStore.snapshots.map((s) => [s.date, s]));
  let snapChanged = false;

  let profilePatch: UserProfile | null = null;

  for (const row of rows) {
    if (row.kind === 'transaction') {
      const local = byId.get(row.item_id);
      const localClock = local ? txClock(local) : (tombstones[row.item_id] ?? null);
      if (localClock && localClock >= row.updated_at) continue; // local same/newer
      if (row.deleted) {
        if (byId.delete(row.item_id)) txChanged = true;
        delete tombstones[row.item_id];
      } else {
        // Validate before trusting: a malformed remote row must not poison local totals.
        const tx = validateTransaction(row.data);
        if (!tx) continue;
        byId.set(row.item_id, tx);
        delete tombstones[row.item_id];
        txChanged = true;
      }
    } else if (row.kind === 'snapshot') {
      const local = snapByDate.get(row.item_id);
      const localClock = local ? snapClock(local) : null;
      if (localClock && localClock >= row.updated_at) continue;
      if (!row.deleted) {
        const snap = validateSnapshot(row.data);
        if (snap) { snapByDate.set(row.item_id, snap); snapChanged = true; }
      }
    } else if (row.kind === 'profile') {
      const local = useProfileStore.getState().profile;
      const localClock = local.updatedAt ?? EPOCH;
      if (localClock >= row.updated_at) continue;
      const prof = validateProfile(row.data);
      if (prof) profilePatch = prof;
    }
  }

  if (txChanged) useTransactionStore.setState({ transactions: [...byId.values()], tombstones });
  if (snapChanged) useSnapshotStore.setState({ snapshots: [...snapByDate.values()] });
  if (profilePatch) useProfileStore.setState({ profile: profilePatch });
}

// ---- the sync cycle ---------------------------------------------------------

let running = false;
let queued = false;

export async function sync(): Promise<void> {
  if (!supabase) return;
  const sb = supabase;
  const user = useAuthStore.getState().user;
  if (!user) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    useSyncStore.getState().setStatus('offline');
    return;
  }
  if (running) { queued = true; return; }
  running = true;

  const syncState = useSyncStore.getState();
  syncState.setStatus('syncing');

  try {
    // 1) PULL changes since the last high-water mark and merge (LWW).
    let pullQuery = sb.from('sync_items').select('kind,item_id,data,deleted,updated_at').order('updated_at', { ascending: true });
    if (syncState.lastPullAt) pullQuery = pullQuery.gt('updated_at', syncState.lastPullAt);
    const { data: pulled, error: pullErr } = await pullQuery;
    if (pullErr) throw pullErr;
    const rows = (pulled ?? []) as RemoteRow[];
    applyRemote(rows);
    const newPullCursor = rows.length ? rows[rows.length - 1].updated_at : syncState.lastPullAt;

    // 2) PUSH local items changed since the last push.
    const pushCutoff = new Date().toISOString();
    const local = collectLocal();
    const toPush = local.filter((i) => !syncState.lastPushAt || i.updatedAt > syncState.lastPushAt);
    if (toPush.length) {
      const payload = toPush.map((i) => ({
        user_id: user.id, kind: i.kind, item_id: i.item_id, data: i.data, deleted: i.deleted, updated_at: i.updatedAt,
      }));
      const { error: pushErr } = await sb.from('sync_items').upsert(payload, { onConflict: 'user_id,kind,item_id' });
      if (pushErr) throw pushErr;
    }

    useSyncStore.getState().setCursors({ lastPullAt: newPullCursor, lastPushAt: pushCutoff, lastSyncedAt: new Date().toISOString() });
    useSyncStore.getState().setStatus('synced');
  } catch (err) {
    useSyncStore.getState().setStatus('error', err instanceof Error ? err.message : 'Sync failed');
  } finally {
    running = false;
    if (queued) { queued = false; void sync(); }
  }
}

// ---- triggers ---------------------------------------------------------------

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
function scheduleSync(delay = 1500) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void sync(), delay);
}

let initialized = false;

/** Wire up sync triggers once. No-op when Supabase is unconfigured. */
export function initSync() {
  if (initialized || !supabase) return;
  initialized = true;

  // React to sign-in / sign-out.
  let prevUserId = useAuthStore.getState().user?.id ?? null;
  useAuthStore.subscribe((state) => {
    const id = state.user?.id ?? null;
    if (id === prevUserId) return;
    prevUserId = id;
    if (id) void sync();
    else useSyncStore.getState().reset();
  });

  // React to local data changes (debounced push).
  useTransactionStore.subscribe(() => scheduleSync());
  useProfileStore.subscribe(() => scheduleSync());
  useSnapshotStore.subscribe(() => scheduleSync());

  // React to connectivity.
  window.addEventListener('online', () => void sync());
  window.addEventListener('offline', () => useSyncStore.getState().setStatus('offline'));

  // Safety-net poll.
  setInterval(() => void sync(), 60_000);

  // Initial sync if already signed in.
  if (useAuthStore.getState().user) void sync();
}
