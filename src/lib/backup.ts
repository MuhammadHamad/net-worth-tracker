import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { nowISO, todayISO } from '@/lib/formatters';
import type { Transaction, UserProfile, NetWorthSnapshot } from '@/types';

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
  };
}

/** Snapshot all on-device financial data into a portable object. */
export function buildBackup(): BackupFile {
  const tx = useTransactionStore.getState();
  return {
    app: APP_TAG,
    version: 1,
    exportedAt: nowISO(),
    data: {
      transactions: tx.transactions,
      tombstones: tx.tombstones,
      profile: useProfileStore.getState().profile,
      snapshots: useSnapshotStore.getState().snapshots,
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

/** Parse + validate backup text, throwing a friendly error on bad input. */
export function parseBackup(text: string): BackupFile {
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
  return {
    app: root.app ?? APP_TAG,
    version: root.version ?? 1,
    exportedAt: root.exportedAt ?? '',
    data: {
      transactions: data.transactions as Transaction[],
      tombstones: (data.tombstones as Record<string, string>) ?? {},
      profile: (data.profile as UserProfile) ?? { name: '', currency: 'PKR' },
      snapshots: Array.isArray(data.snapshots) ? (data.snapshots as NetWorthSnapshot[]) : [],
    },
  };
}

/** Replace all on-device data with the contents of a backup. */
export function restoreBackup(backup: BackupFile) {
  useTransactionStore.setState({ transactions: backup.data.transactions, tombstones: backup.data.tombstones });
  useProfileStore.setState({ profile: backup.data.profile });
  useSnapshotStore.setState({ snapshots: backup.data.snapshots });
}
