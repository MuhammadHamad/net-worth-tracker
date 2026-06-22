import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface SignUpResult { error: string | null; needsConfirmation: boolean }

interface AuthStore {
  session: Session | null;
  user: User | null;
  ready: boolean; // initial session check finished
  /** Create an account. With email confirmation on, returns needsConfirmation=true and no session. */
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  /** Log in with email + password. Returns an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email already has an account — log in instead.';
  if (m.includes('password should be at least')) return 'Password must be at least 6 characters.';
  return message;
}

export const useAuthStore = create<AuthStore>(() => ({
  session: null,
  user: null,
  ready: !supabase, // if not configured, there is nothing to wait for
  signUp: async (email, password) => {
    if (!supabase) return { error: 'Cloud sync is not configured.', needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return { error: friendly(error.message), needsConfirmation: false };
    // When "Confirm email" is on, signUp returns a user but no session until confirmed.
    return { error: null, needsConfirmation: !data.session };
  },
  signIn: async (email, password) => {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? friendly(error.message) : null;
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
