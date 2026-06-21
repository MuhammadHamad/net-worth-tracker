import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

interface ProfileStore {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: { name: '', currency: 'PKR' },
      setProfile: (p) => set({ profile: p }),
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
    }),
    { name: 'nw_profile' }
  )
);
