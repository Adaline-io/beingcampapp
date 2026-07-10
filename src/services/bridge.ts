import { isBackendEnabled } from '../lib/config';
import * as auth from './auth';
import * as data from './data';

/**
 * Backend bridge — connects the app controller to Supabase when configured.
 *
 * The design-layer controller (src/legacy/20-app-controller.jsx) drives every
 * screen from React state persisted to localStorage. Rather than rewrite all
 * screens at once, this bridge mirrors the controller's actions to the real
 * backend and hydrates its initial state from the database:
 *
 *   boot()            session? → profile + wallet + ledger + orders
 *   signIn(profile)   auth user (anonymous for MVP) + profile row
 *   syncTransaction() balance update + ledger insert
 *   syncProfile()     profile row patch
 *   syncOrder()       order row insert
 *   signOut()         end session
 *
 * Local mode (no VITE_SUPABASE_* env): `enabled` is false and the controller
 * skips every call — the demo behaves exactly as before. Live mode failures
 * degrade gracefully: the UI state (still persisted locally) stays authoritative
 * and the error is logged, so a flaky network never blocks the app.
 */

/* ------------------------------ UI-shape types ----------------------------- */

interface UiProfile {
  name: string;
  accent: string;
  city: string;
  headline: string;
  bio: string;
  skills: string[];
  path: string;
  since?: string;
}

interface UiTxn {
  id: string;
  label: string;
  amount: number;
  ref: string;
  when: string;
}

interface UiOrder {
  id: string;
  item: string;
  source: string | null;
  bc: number;
  tone: string;
  type: string;
  stage: number;
  when: string;
  eta: string;
}

interface BootState {
  profile: UiProfile | null;
  balance: number;
  activityCoins: number;
  txns: UiTxn[];
  orders: UiOrder[];
}

/* --------------------------------- Helpers -------------------------------- */

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function sinceLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }).replace(' ', " '");
}

// The ledger's ref column has a check constraint; anything unknown files under 'admin'.
const TXN_REFS = new Set(['ritual', 'zone', 'pool', 'store', 'pack', 'service', 'gift', 'admin']);
const safeRef = (ref: string) => (TXN_REFS.has(ref) ? ref : 'admin');

type ProfileRow = {
  id: string;
  name: string | null;
  accent: string;
  city: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[];
  path: string | null;
  balance: number;
  activity_coins: number;
  created_at: string;
};

function rowToProfile(row: ProfileRow): UiProfile {
  return {
    name: row.name ?? 'You',
    accent: row.accent,
    city: row.city ?? '',
    headline: row.headline ?? '',
    bio: row.bio ?? '',
    skills: row.skills ?? [],
    path: row.path ?? 'maker',
    since: sinceLabel(row.created_at),
  };
}

async function currentUserId(): Promise<string | null> {
  const session = await auth.getSession();
  return session?.user?.id ?? null;
}

/* --------------------------------- Bridge --------------------------------- */

export const backend = {
  enabled: isBackendEnabled,

  /** Restore session + hydrate app state from the database. Null = start local. */
  async boot(): Promise<BootState | null> {
    if (!isBackendEnabled) return null;
    try {
      const userId = await currentUserId();
      if (!userId) return null;

      const profileRow = (await data
        .getMyProfile(userId)
        .catch(() => null)) as ProfileRow | null;
      if (!profileRow) return null;

      const [txnRows, orderRows] = await Promise.all([
        data.getTransactions(userId).catch(() => []),
        data.getOrders(userId).catch(() => []),
      ]);

      return {
        profile: rowToProfile(profileRow),
        balance: profileRow.balance,
        activityCoins: profileRow.activity_coins,
        txns: (txnRows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id),
          label: String(r.label),
          amount: Number(r.amount),
          ref: String(r.ref),
          when: timeAgo(String(r.created_at)),
        })),
        orders: (orderRows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.ref ?? r.id),
          item: String(r.item),
          source: (r.source as string | null) ?? null,
          bc: Number(r.bc),
          tone: String(r.tone),
          type: String(r.type),
          stage: Number(r.stage),
          when: timeAgo(String(r.created_at)),
          eta: Number(r.stage) >= 4 ? 'Ready to use' : 'Arrives in 3–5 days',
        })),
      };
    } catch (err) {
      console.warn('[beingcamp] backend boot failed, continuing locally:', err);
      return null;
    }
  },

  /** Create the auth user + profile row when onboarding completes. */
  async signIn(profile: Partial<UiProfile>, startingBalance = 100): Promise<void> {
    if (!isBackendEnabled) return;
    let userId = await currentUserId();
    if (!userId) {
      const session = await auth.signInAnonymously();
      userId = session?.user?.id ?? null;
    }
    if (!userId) throw new Error('sign-in produced no session');

    const { requireSupabase } = await import('../lib/supabase');
    const sb = requireSupabase();
    const { error } = await sb.from('profiles').upsert({
      id: userId,
      name: profile.name ?? 'You',
      accent: profile.accent ?? '#c9a84c',
      city: profile.city ?? null,
      headline: profile.headline ?? null,
      bio: profile.bio ?? null,
      skills: profile.skills ?? [],
      path: profile.path ?? 'maker',
      balance: startingBalance,
      activity_coins: startingBalance,
    });
    if (error) throw error;
  },

  /** Mirror a wallet action (earn/spend/pack) into the balance + ledger. */
  async syncTransaction(label: string, amount: number, ref: string): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId) return;
    await data.recordTransaction({ label, amount, ref: safeRef(ref) });
  },

  /** Mirror a profile edit. */
  async syncProfile(patch: Partial<UiProfile>): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId) return;
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.accent !== undefined) row.accent = patch.accent;
    if (patch.city !== undefined) row.city = patch.city;
    if (patch.headline !== undefined) row.headline = patch.headline;
    if (patch.bio !== undefined) row.bio = patch.bio;
    if (patch.skills !== undefined) row.skills = patch.skills;
    if (patch.path !== undefined) row.path = patch.path;
    if (Object.keys(row).length === 0) return;
    row.updated_at = new Date().toISOString();
    await data.updateMyProfile(userId, row);
  },

  /** Mirror a store order. */
  async syncOrder(order: {
    item: string;
    source?: string;
    bc: number;
    tone?: string;
    type?: string;
    stage?: number;
  }): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId) return;
    await data.createOrder({
      profile_id: userId,
      item: order.item,
      source: order.source ?? null,
      bc: order.bc,
      tone: order.tone ?? '#c9a84c',
      type: order.type === 'pass' ? 'pass' : 'physical',
      stage: order.stage ?? 0,
    });
  },

  async signOut(): Promise<void> {
    if (!isBackendEnabled) return;
    await auth.signOut();
  },
};

/**
 * Expose the bridge to the design layer (which runs as plain JSX and reaches
 * shared code through window globals, same as React itself).
 */
export function installBackendBridge(): void {
  (window as unknown as Record<string, unknown>).BeingCampBackend = backend;
}
