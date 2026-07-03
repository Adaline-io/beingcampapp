import type { Session, User } from '@supabase/supabase-js';
import { requireSupabase, supabase } from '../lib/supabase';
import { isBackendEnabled } from '../lib/config';

/**
 * Auth service — phone OTP (the flow the onboarding screens model:
 * Splash → Phone → OTP → Initiation).
 *
 * In local mode these are no-ops so the legacy demo onboarding keeps working.
 */

export async function sendPhoneOtp(phone: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<Session | null> {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data.session;
}

/** Email magic-link — handy for web testing without SMS credits. */
export async function sendEmailOtp(email: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifyEmailOtp(email: string, token: string): Promise<Session | null> {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Subscribe to auth changes. Returns an unsubscribe function (no-op in local mode). */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  if (!supabase) {
    cb(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export { isBackendEnabled };
