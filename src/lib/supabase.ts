import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isBackendEnabled } from './config';
import type { Database } from './database.types';

/**
 * The Supabase browser client.
 *
 * `null` when no backend is configured — callers must guard with
 * `isBackendEnabled` (or use the service layer in `src/services`, which already
 * falls back to local mode). We deliberately export a possibly-null client
 * instead of throwing so the app boots in local/demo mode with zero config.
 */
export const supabase: SupabaseClient<Database> | null = isBackendEnabled
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Narrowing helper: returns the client or throws (use inside backend-only paths). */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}
