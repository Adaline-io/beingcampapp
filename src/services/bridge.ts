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
  projects: Array<Record<string, unknown>>;
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

      const [txnRows, orderRows, projectRows] = await Promise.all([
        data.getTransactions(userId).catch(() => []),
        data.getOrders(userId).catch(() => []),
        data.getMyProjects().catch(() => []),
      ]);

      return {
        profile: rowToProfile(profileRow),
        balance: profileRow.balance,
        activityCoins: profileRow.activity_coins,
        projects: (projectRows as Array<Record<string, unknown>>).map((r) =>
          backend.mapProject(r)
        ),
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

  /**
   * Load the public catalog (packs, store, services, open briefs) from the
   * database, mapped to the shapes the screens render. Needs no session —
   * these tables are public-read under RLS. Null on any failure → screens
   * keep their built-in demo catalog.
   */
  async loadCatalog(): Promise<Record<string, unknown> | null> {
    if (!isBackendEnabled) return null;
    try {
      const [packs, products, services, briefs, pubs, workshops, zones, leaders] =
        await Promise.all([
          data.getCoinPacks(),
          data.getProducts(),
          data.getServices(),
          data.getPoolBriefs(),
          data.getPublications().catch(() => []),
          data.getWorkshops().catch(() => []),
          data.getZones().catch(() => []),
          data.getLeaders().catch(() => []),
        ]);
      if (!packs.length && !products.length) return null;
      const zoneName = new Map(
        (zones as Array<Record<string, unknown>>).map((z) => [String(z.id), String(z.name)])
      );
      const initials = (name: string) =>
        name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

      const uiPacks = (packs as Array<Record<string, unknown>>).map((p, i) => {
        const coins = Number(p.coins);
        const bonus = Number(p.bonus ?? 0);
        const inr = Math.round(Number(p.price_cents) / 100);
        const per = inr / (coins + bonus);
        return {
          id: String(p.id),
          name: String(p.name),
          coins,
          bonus,
          inr,
          rate: `₹${per % 1 === 0 ? per : per.toFixed(2)}/BC`,
          popular: i === 2, // middle-upper pack gets the "Most popular" flag
        };
      });

      const uiProducts = (products as Array<Record<string, unknown>>).map((p) => ({
        id: String(p.id),
        name: String(p.name),
        cat: String(p.cat ?? 'Goods'),
        source: String(p.source),
        bc: Number(p.bc),
        type: p.type === 'physical' ? 'physical' : 'pass',
        stock: 99,
        tone: String(p.tone ?? '#26201a'),
        tag: String(p.cat ?? 'New'),
      }));
      const storeCats = ['All', ...new Set(uiProducts.map((p) => p.cat))];

      const uiServices = (services as Array<Record<string, unknown>>).map((s) => ({
        id: String(s.id),
        name: String(s.name),
        div: String(s.provider),
        deposit: Math.max(50, Math.round(Number(s.bc) * 0.25 / 10) * 10),
        from: Number(s.bc),
        timeline: String(s.cat ?? 'On scope'),
        tone: '#262017',
      }));

      const uiOpenWork = (briefs as Array<Record<string, unknown>>).map((b) => ({
        id: String(b.id),
        title: String(b.title),
        poster: String(b.org),
        cat: String(b.cat),
        pay: Number(b.budget),
        need: `${b.cat} team`,
        team: 2,
        deadline: 'Open',
        minRank: 1,
        applicants: 0,
        desc: String(b.summary ?? ''),
      }));

      const uiPublications = (pubs as Array<Record<string, unknown>>).map((p) => ({
        id: String(p.id),
        type: String(p.kind),
        title: String(p.title),
        author: String(p.author),
        init: initials(String(p.author)),
        tone: String(p.tone ?? '#26201a'),
        tags: [p.kind === 'Theory' ? 'Essay' : 'New'],
        claps: 0,
        read: p.kind === 'Work' ? 'Gallery' : '4 min',
        excerpt: String(p.summary ?? ''),
        authorId: (p.author_id as string | null) ?? null,
      }));

      const uiWorkshops = (workshops as Array<Record<string, unknown>>).map((w) => ({
        id: String(w.id),
        title: String(w.title),
        host: String(w.host),
        init: initials(String(w.host)),
        when: String(w.when_text ?? 'Soon'),
        date: String(w.date_text ?? 'soon'),
        zone: zoneName.get(String(w.zone_id)) ?? 'The Camp',
        cost: Number(w.cost ?? 0),
        seats: Number(w.seats ?? 0),
        taken: Number(w.taken ?? 0),
        tag: String(w.tag ?? 'Session'),
        tone: String(w.tone ?? '#26201a'),
        desc: String(w.description ?? ''),
      }));

      const tier = (rankIndex: number) =>
        rankIndex >= 4 ? 'OG' : rankIndex >= 2 ? 'Loyal' : 'Regular';
      const me = await currentUserId().catch(() => null);
      const uiLeaders = (leaders as Array<Record<string, unknown>>).map((p, i) => ({
        rank: i + 1,
        name: String(p.name ?? 'Member'),
        init: initials(String(p.name ?? '?')),
        earned: Number(p.activity_coins ?? 0),
        delivered: 0,
        tier: tier(Number(p.rank_index ?? 0)),
        you: me !== null && String(p.id) === me,
      }));

      return {
        packs: uiPacks,
        products: uiProducts,
        storeCats,
        services: uiServices,
        openWork: uiOpenWork,
        publications: uiPublications,
        workshops: uiWorkshops,
        leaders: uiLeaders,
      };
    } catch (err) {
      console.warn('[beingcamp] catalog load failed, using demo catalog:', err);
      return null;
    }
  },

  /**
   * Create the auth user + profile row when onboarding completes.
   *
   * Method chain — whichever the project's auth settings allow first wins:
   *  1. anonymous sign-in (needs "Allow anonymous sign-ins")
   *  2. device account: generated email+password kept in localStorage
   *     (needs "Confirm email" off; created once, signed back into after that)
   */
  async signIn(profile: Partial<UiProfile>, startingBalance = 100): Promise<void> {
    if (!isBackendEnabled) return;
    let userId = await currentUserId();
    if (!userId) {
      try {
        const session = await auth.signInAnonymously();
        userId = session?.user?.id ?? null;
      } catch (anonErr) {
        console.warn('[beingcamp] anonymous sign-in unavailable, trying device account:', anonErr);
        const CREDS_KEY = 'beingcamp_device_account';
        let creds: { email: string; password: string } | null = null;
        try {
          creds = JSON.parse(localStorage.getItem(CREDS_KEY) ?? 'null');
        } catch {
          creds = null;
        }
        if (!creds) {
          creds = {
            email: `member-${crypto.randomUUID()}@members.beingcamp.app`,
            password: crypto.randomUUID() + crypto.randomUUID(),
          };
        }
        let session = await auth.signInWithPassword(creds.email, creds.password).catch(() => null);
        if (!session) session = await auth.signUpWithPassword(creds.email, creds.password);
        if (!session) {
          throw new Error(
            'sign-up needs email confirmation — disable "Confirm email" or enable anonymous sign-ins in Supabase Auth settings'
          );
        }
        localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
        userId = session.user?.id ?? null;
      }
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

  /* ------------------- Shared data loop (projects & community) ------------------- */

  /** Zone check-in: rank gate + cost charged server-side (record_checkin RPC). */
  async syncCheckin(zoneId: string): Promise<void> {
    if (!isBackendEnabled) return;
    if (!(await currentUserId())) return;
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().rpc('record_checkin', { p_zone_id: zoneId });
    if (error) throw error;
  },

  /**
   * Create a real project (+ milestones + poster membership) and return it in
   * the UI workspace shape, so the controller can swap its local copy for the
   * server one (milestones carry dbId for later escrow release).
   */
  async syncProject(input: {
    title: string;
    cat: string;
    budget: number;
    milestones: Array<{ name: string; bc: number }>;
  }): Promise<Record<string, unknown> | null> {
    if (!isBackendEnabled) return null;
    if (!(await currentUserId())) return null;
    const { requireSupabase } = await import('../lib/supabase');
    const sb = requireSupabase();
    const { data: projectId, error } = await sb.rpc('create_project', {
      p_title: input.title,
      p_cat: input.cat,
      p_budget: Math.round(input.budget),
      p_milestones: input.milestones.map((m) => ({ label: m.name, amount: Math.round(m.bc) })),
    });
    if (error) throw error;
    const { data: rows, error: qErr } = await sb
      .from('projects')
      .select('*, project_milestones(*), project_members(*)')
      .eq('id', projectId as string);
    if (qErr) throw qErr;
    const row = rows?.[0];
    return row ? this.mapProject(row as Record<string, unknown>) : null;
  },

  /** Escrow release for a server-backed milestone (owner-only, paid in SQL). */
  async releaseMilestone(milestoneDbId: string): Promise<void> {
    if (!isBackendEnabled) return;
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().rpc('release_milestone', {
      p_milestone_id: milestoneDbId,
    });
    if (error) throw error;
  },

  /** Publish to the shared Showcase. */
  async syncPublication(input: { type: string; title: string; author: string }): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId) return;
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('publications').insert({
      author_id: userId,
      author: input.author,
      title: input.title,
      kind: ['Case Study', 'Work', 'Theory'].includes(input.type) ? input.type : 'Work',
      summary: 'Published from the app.',
    });
    if (error) throw error;
  },

  /** RSVP to a database workshop (uuid ids only — demo ids stay local). */
  async syncRsvp(workshopId: string): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId) return;
    if (!/^[0-9a-f-]{36}$/i.test(workshopId)) return;
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase()
      .from('workshop_rsvps')
      .insert({ workshop_id: workshopId, profile_id: userId });
    if (error && !String(error.message).includes('duplicate')) throw error;
  },

  /** DB project row (+milestones/members) → the UI workspace shape. */
  mapProject(row: Record<string, unknown>): Record<string, unknown> {
    const ms = ((row.project_milestones as Array<Record<string, unknown>>) ?? [])
      .slice()
      .sort((a, b) => Number(a.sort) - Number(b.sort));
    const firstOpen = ms.findIndex((m) => !m.released);
    return {
      id: String(row.id),
      title: String(row.title),
      poster: 'You',
      cat: String(row.cat ?? 'Branding'),
      you: 'poster',
      role: 'Poster',
      stage: Number(row.stage ?? 1),
      budget: Number(row.budget ?? 0),
      escrowReleased: ms.filter((m) => m.released).reduce((s, m) => s + Number(m.amount), 0),
      deadline: 'Open',
      team: [],
      shortlist: [],
      milestones: ms.map((m, i) => ({
        dbId: String(m.id),
        name: String(m.label),
        bc: Number(m.amount),
        status: m.released ? 'done' : i === firstOpen ? 'active' : 'todo',
      })),
      chat: [],
      files: [],
      schedule: [],
    };
  },
};

/**
 * Expose the bridge to the design layer (which runs as plain JSX and reaches
 * shared code through window globals, same as React itself).
 */
export function installBackendBridge(): void {
  (window as unknown as Record<string, unknown>).BeingCampBackend = backend;
}
