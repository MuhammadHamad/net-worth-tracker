import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCashbookStore } from '@/store/useCashbookStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useUiStore } from '@/store/useUiStore';
import { useSyncStore } from '@/store/useSyncStore';

/**
 * Permanently delete user account, saved transactions, assets, loans, cashbook entries, and cloud data.
 */
export async function resetAllData(): Promise<{ cloudError: string | null }> {
  let cloudError: string | null = null;

  if (supabase) {
    const user = useAuthStore.getState().user;
    if (user) {
      const { error } = await supabase.from('sync_items').delete().eq('user_id', user.id);
      if (error) cloudError = error.message;
      await useAuthStore.getState().signOut();
    }
  }

  useTransactionStore.setState({ transactions: [], tombstones: {} });
  useCashbookStore.getState().clearEntries();
  useSnapshotStore.setState({ snapshots: [] });
  useProfileStore.setState({ profile: { name: '', currency: useProfileStore.getState().profile.currency } });
  useUiStore.setState({ authSkipped: false, onboardingDone: false, milestoneReached: -1 });
  useSyncStore.getState().reset();

  return { cloudError };
}
