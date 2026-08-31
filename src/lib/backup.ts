import { useTransactionStore } from '@/store/useTransactionStore';
import { useCashbookStore } from '@/store/useCashbookStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { nowISO, todayISO } from '@/lib/formatters';
import { filterValidTransactions, filterValidCashbookEntries, validateSnapshot, validateProfile } from '@/lib/schemas';
import type { Transaction, UserProfile, NetWorthSnapshot } from '@/types';
import type { CashbookEntry } from '@/types/cashbook';

const APP_TAG = 'networth-tracker';

export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  data: {
    transactions: Transaction[];
    tombstones: Record<string, string>;
    profile: UserProfile;
    snapshots: NetWorthSnapshot[];
    cashbook?: CashbookEntry[];
    cashbookTombstones?: Record<string, string>;
  };
}

/** Snapshot all on-device financial data into a portable object. */
export function buildBackup(): BackupFile {
  const tx = useTransactionStore.getState();
  const cb = useCashbookStore.getState();
  return {
    app: APP_TAG,
    version: 2,
    exportedAt: nowISO(),
    data: {
      transactions: tx.transactions,
      tombstones: tx.tombstones,
      profile: useProfileStore.getState().profile,
      snapshots: useSnapshotStore.getState().snapshots,
      cashbook: cb.entries,
      cashbookTombstones: cb.tombstones,
    },
  };
}

/** Build a backup and trigger a file download. */
export function downloadBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `networth-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A parsed backup plus how many malformed records were dropped during validation. */
export interface ParsedBackup { backup: BackupFile; skipped: number }

/**
 * Parse + validate backup text, throwing a friendly error on bad input. Every record is
 * schema-checked; malformed ones are dropped (not trusted) and counted in `skipped`, so a
 * corrupt or hand-edited file can never inject NaN/wrong-typed values into the stores.
 */
export function parseBackup(text: string): ParsedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file isn’t valid JSON.');
  }
  const root = parsed as { app?: string; version?: number; exportedAt?: string; data?: Record<string, unknown> };
  const data = root?.data;
  if (!data || !Array.isArray(data.transactions)) {
    throw new Error('This doesn’t look like a NetWorth backup.');
  }

  const { valid: transactions, skipped: txSkipped } = filterValidTransactions(data.transactions as unknown[]);

  let cashbook: CashbookEntry[] = [];
  let cbSkipped = 0;
  if (Array.isArray(data.cashbook)) {
    const res = filterValidCashbookEntries(data.cashbook as unknown[]);
    cashbook = res.valid;
    cbSkipped = res.skipped;
  }

  const snapshots: NetWorthSnapshot[] = [];
  let snapSkipped = 0;
  if (Array.isArray(data.snapshots)) {
    for (const s of data.snapshots as unknown[]) {
      const v = validateSnapshot(s);
      if (v) snapshots.push(v);
      else snapSkipped++;
    }
  }

  const profile = validateProfile(data.profile) ?? { name: '', currency: 'PKR' };
  const tombstones = validTombstones(data.tombstones);
  const cashbookTombstones = validTombstones(data.cashbookTombstones);

  return {
    backup: {
      app: root.app ?? APP_TAG,
      version: root.version ?? 1,
      exportedAt: root.exportedAt ?? '',
      data: { transactions, tombstones, profile, snapshots, cashbook, cashbookTombstones },
    },
    skipped: txSkipped + snapSkipped + cbSkipped,
  };
}

/** Keep only string→string entries; anything else is ignored. */
function validTombstones(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

/** Replace all on-device data with the contents of a backup. */
export function restoreBackup(backup: BackupFile) {
  useTransactionStore.setState({ transactions: backup.data.transactions, tombstones: backup.data.tombstones });
  useProfileStore.setState({ profile: backup.data.profile });
  useSnapshotStore.setState({ snapshots: backup.data.snapshots });
  if (backup.data.cashbook) {
    useCashbookStore.setState({
      entries: backup.data.cashbook,
      tombstones: backup.data.cashbookTombstones ?? {},
    });
  }
}
