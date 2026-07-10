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

/**
 * Production project defaults (the "beingcampapp" Supabase project).
 * The anon key is a PUBLISHABLE credential — it ships in every client bundle
 * by design and grants nothing beyond what Row Level Security allows.
 *
 * Overrides:
 *  - VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY point at a different project
 *    (empty/unset falls back to the defaults below).
 *  - VITE_FORCE_LOCAL=1 forces local/demo mode — CI and the E2E suite set this
 *    so test runs never touch the production database.
 */
const DEFAULT_SUPABASE_URL = 'https://eutcbcbalfnwgqddhdog.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dGNiY2JhbGZud2dxZGRoZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjQ0NDksImV4cCI6MjA5OTIwMDQ0OX0.ELqicTfkaRtdm3en1LOAu1drU7lDzsaq9uhZ0zvQbn4';

const forceLocal = ['1', 'true'].includes(String(import.meta.env.VITE_FORCE_LOCAL ?? '').trim());

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? '').trim() || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim() || DEFAULT_SUPABASE_ANON_KEY;

/** True when a real Supabase project is configured (and not forced local). */
export const isBackendEnabled = !forceLocal && Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
