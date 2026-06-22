import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  session: Session | null;
  user: User | null;
  ready: boolean; // initial session check finished
  /** Send a passwordless magic link to the given email. Returns an error message, or null on success. */
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(() => ({
  session: null,
  user: null,
  ready: !supabase, // if not configured, there is nothing to wait for
  signInWithMagicLink: async (email) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? error.message : null;
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
}));

/** Wire Supabase session → store. Call once at startup. No-op when unconfigured. */
export function initAuth() {
  if (!supabase) return;
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, ready: true });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, ready: true });
  });
}
