import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useUiStore } from '@/store/useUiStore';
import { useSyncStore } from '@/store/useSyncStore';

/**
 * Permanently erase all financial data — local and, if signed in, the cloud copy.
 *
 * Cloud rows are deleted first, directly (bypassing the tombstone mechanism, which only
 * tracks per-item deletes): a local-only wipe would otherwise be silently undone by the
 * next pull, since the server would still hold everything.
 */
export async function resetAllData(): Promise<{ cloudError: string | null }> {
  let cloudError: string | null = null;

  if (supabase) {
    const user = useAuthStore.getState().user;
    if (user) {
      const { error } = await supabase.from('sync_items').delete().eq('user_id', user.id);
      if (error) cloudError = error.message;
    }
  }

  useTransactionStore.setState({ transactions: [], tombstones: {} });
  useSnapshotStore.setState({ snapshots: [] });
  useProfileStore.setState({ profile: { name: '', currency: useProfileStore.getState().profile.currency } });
  useUiStore.setState({ onboardingDone: false, milestoneReached: -1 });
  useSyncStore.getState().reset();

  return { cloudError };
}
