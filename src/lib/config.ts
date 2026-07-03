/**
 * Runtime configuration + feature flags.
 *
 * The app is designed to run in two modes:
 *  - "local"   — no backend configured; state lives in localStorage (the MVP /
 *                offline / demo experience). This is the default so the app
 *                always runs, even before Supabase is provisioned.
 *  - "backend" — Supabase URL + anon key present; auth, data and realtime go
 *                through Postgres.
 *
 * Flip modes purely by setting env vars — no code changes required.
 */

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** True when a real Supabase project is configured. */
export const isBackendEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export type BackendMode = 'backend' | 'local';
export const backendMode: BackendMode = isBackendEnabled ? 'backend' : 'local';

export function logBackendStatus(): void {
  if (isBackendEnabled) {
    console.info(
      '%cBeingCamp',
      'color:#c9a84c;font-weight:700',
      '· backend: Supabase (' + SUPABASE_URL + ')',
    );
  } else {
    console.info(
      '%cBeingCamp',
      'color:#c9a84c;font-weight:700',
      '· backend: local (localStorage). Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to go live.',
    );
  }
}
