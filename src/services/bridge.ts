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
  isAdmin: boolean;
  isStaff: boolean;
  teamRole: string | null;
  rankIndex: number;
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
        isAdmin: Boolean((profileRow as Record<string, unknown>).is_admin),
        isStaff: Boolean((profileRow as Record<string, unknown>).is_staff),
        teamRole: ((profileRow as Record<string, unknown>).team_role as string | null) ?? null,
        rankIndex: Number((profileRow as Record<string, unknown>).rank_index ?? 0),
        profile: rowToProfile(profileRow),
        balance: profileRow.balance,
        activityCoins: profileRow.activity_coins,
        projects: (projectRows as Array<Record<string, unknown>>).map((r) =>
          backend.mapProject(r, userId)
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
      const [packs, products, services, briefs, pubs, workshops, zones, leaders, challengeRows, crewRows] =
        await Promise.all([
          data.getCoinPacks(),
          data.getProducts(),
          data.getServices(),
          data.getPoolBriefs(),
          data.getPublications().catch(() => []),
          data.getWorkshops().catch(() => []),
          data.getZones().catch(() => []),
          data.getLeaders().catch(() => []),
          (async () => {
            const { requireSupabase } = await import('../lib/supabase');
            const { data: rows } = await requireSupabase()
              .from('challenges')
              .select('*, challenge_entries(count)')
              .eq('status', 'open')
              .order('created_at', { ascending: false });
            return rows ?? [];
          })().catch(() => []),
          (async () => {
            // Open crew seats across all projects — the dispatch feed.
            const { requireSupabase } = await import('../lib/supabase');
            const { data: rows } = await requireSupabase()
              .from('project_roles')
              .select('id, role, share_pct, project_id, projects(title, cat, budget, owner_id)')
              .eq('status', 'open')
              .order('created_at', { ascending: false })
              .limit(50);
            return rows ?? [];
          })().catch(() => []),
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

      const uiChallenges = (challengeRows as Array<Record<string, unknown>>).map((c) => ({
        id: String(c.id),
        title: String(c.title),
        industry: String(c.industry),
        reward: Number(c.reward),
        deadline: String(c.deadline_text),
        tag: String(c.tag),
        desc: String(c.description ?? ''),
        entries: Number(
          ((c.challenge_entries as Array<{ count?: number }>) ?? [])[0]?.count ?? 0
        ),
      }));

      const uiCrewCalls = (crewRows as Array<Record<string, unknown>>)
        .filter((r) => r.projects)
        .map((r) => {
          const p = r.projects as Record<string, unknown>;
          return {
            id: String(r.id),
            role: String(r.role),
            sharePct: Number(r.share_pct ?? 0),
            projectId: String(r.project_id),
            title: String(p.title),
            cat: String(p.cat ?? 'Branding'),
            budget: Number(p.budget ?? 0),
            ownerId: String(p.owner_id ?? ''),
          };
        });

      return {
        crewCalls: uiCrewCalls,
        challenges: uiChallenges,
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
    roles?: Array<{ role: string; sharePct: number }>;
  }): Promise<Record<string, unknown> | null> {
    if (!isBackendEnabled) return null;
    const me = await currentUserId();
    if (!me) return null;
    const { requireSupabase } = await import('../lib/supabase');
    const sb = requireSupabase();
    const { data: projectId, error } = await sb.rpc('create_project', {
      p_title: input.title,
      p_cat: input.cat,
      p_budget: Math.round(input.budget),
      p_milestones: input.milestones.map((m) => ({ label: m.name, amount: Math.round(m.bc) })),
      p_roles: (input.roles ?? []).map((r) => ({ role: r.role, share_pct: Math.round(r.sharePct) })),
    });
    if (error) throw error;
    const { data: rows, error: qErr } = await sb
      .from('projects')
      .select('*, project_milestones(*), project_members(*, profiles(name)), project_roles(*)')
      .eq('id', projectId as string);
    if (qErr) throw qErr;
    const row = rows?.[0];
    return row ? this.mapProject(row as Record<string, unknown>, me) : null;
  },

  /** Claim an open crew seat (claim_role RPC: locks the row, joins the team). */
  async claimRole(roleId: string): Promise<Record<string, unknown> | null> {
    if (!isBackendEnabled) return null;
    const { requireSupabase } = await import('../lib/supabase');
    const { data: result, error } = await requireSupabase().rpc('claim_role', {
      p_role_id: roleId,
    });
    if (error) throw error;
    return (result as Record<string, unknown>) ?? null;
  },

  /** Token-scoped read-only project snapshot for clients (no account needed). */
  async clientProject(token: string): Promise<Record<string, unknown> | null> {
    if (!isBackendEnabled) return null;
    const { requireSupabase } = await import('../lib/supabase');
    const { data: snapshot, error } = await requireSupabase().rpc('client_project', {
      p_token: token,
    });
    if (error) throw error;
    return (snapshot as Record<string, unknown>) ?? null;
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

  /** Enter a challenge (uuid ids only — demo ids stay local). */
  async syncJoinChallenge(challengeId: string): Promise<void> {
    if (!isBackendEnabled) return;
    const userId = await currentUserId();
    if (!userId || !/^[0-9a-f-]{36}$/i.test(challengeId)) return;
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase()
      .from('challenge_entries')
      .insert({ challenge_id: challengeId, profile_id: userId });
    if (error && !String(error.message).includes('duplicate')) throw error;
  },

  /** Award a challenge pot to a member (admin-gated in SQL). */
  async adminAwardChallenge(challengeId: string, profileId: string): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().rpc('award_challenge', {
      p_challenge: challengeId,
      p_profile: profileId,
    });
    if (error) throw error;
  },

  /** Post a new challenge (admin RLS). */
  async adminAddChallenge(input: {
    title: string; industry: string; reward: number; deadline: string; tag: string; desc: string;
  }): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('challenges').insert({
      title: input.title,
      industry: input.industry,
      reward: Math.round(input.reward),
      deadline_text: input.deadline,
      tag: input.tag,
      description: input.desc,
    });
    if (error) throw error;
  },

  /** Post a new workshop/program (staff or admin RLS). */
  async adminAddWorkshop(input: {
    title: string; host: string; when: string; zoneId: string; cost: number; seats: number; tag: string; desc: string;
  }): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('workshops').insert({
      title: input.title,
      host: input.host,
      when_text: input.when,
      date_text: 'soon',
      zone_id: input.zoneId || null,
      cost: Math.round(input.cost),
      seats: Math.round(input.seats),
      tag: input.tag,
      description: input.desc,
    });
    if (error) throw error;
  },

  /** Toggle a member's staff flag (admin profile-update RLS, 0008). */
  async adminSetStaff(profileId: string, isStaff: boolean): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase()
      .from('profiles')
      .update({ is_staff: isStaff })
      .eq('id', profileId);
    if (error) throw error;
  },

  /** The five weekly numbers, counted in parallel. */
  async adminMetrics(): Promise<Record<string, number>> {
    const { requireSupabase } = await import('../lib/supabase');
    const sb = requireSupabase();
    type CountQuery = ReturnType<ReturnType<typeof sb.from>['select']>;
    const count = async (table: string, filter?: (q: CountQuery) => CountQuery) => {
      let q = sb.from(table).select('*', { count: 'exact', head: true });
      if (filter) q = filter(q);
      const { count: n } = await q;
      return n ?? 0;
    };
    const [members, checkins, delivered, entries, txnRows] = await Promise.all([
      count('profiles'),
      count('zone_checkins'),
      count('projects', (q) => q.eq('stage', 4)),
      count('challenge_entries'),
      sb.from('transactions').select('amount').then((r) => r.data ?? []),
    ]);
    const earned = (txnRows as Array<{ amount: number }>).filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const spent = (txnRows as Array<{ amount: number }>).filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);
    return { members, checkins, delivered, entries, earned, spent };
  },

  /** Recent grant/payout ledger lines for the audit view (admin read, 0008). */
  async adminAudit(): Promise<Array<Record<string, unknown>>> {
    const { requireSupabase } = await import('../lib/supabase');
    const { data: rows, error } = await requireSupabase()
      .from('transactions')
      .select('id, profile_id, label, amount, ref, created_at')
      .in('ref', ['admin', 'ritual'])
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return rows ?? [];
  },

  /* ------------------------------ Agile board ------------------------------ */

  /** Sprint board: all tasks the caller may see (staff: all; member: own). */
  async listTasks(): Promise<Array<Record<string, unknown>>> {
    const { requireSupabase } = await import('../lib/supabase');
    const { data: rows, error } = await requireSupabase()
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(name), task_comments(count)')
      .order('priority')
      .order('created_at');
    if (error) throw error;
    return rows ?? [];
  },

  async addTask(input: { title: string; sprint: string; points: number; assigneeId?: string | null }): Promise<void> {
    const userId = await currentUserId();
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('tasks').insert({
      title: input.title,
      sprint: input.sprint,
      points: Math.max(1, Math.min(13, Math.round(input.points))),
      assignee_id: input.assigneeId ?? null,
      created_by: userId,
    });
    if (error) throw error;
  },

  async moveTask(taskId: string, status: string): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('tasks').update({ status }).eq('id', taskId);
    if (error) throw error;
  },

  async assignTask(taskId: string, assigneeId: string | null): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('tasks').update({ assignee_id: assigneeId }).eq('id', taskId);
    if (error) throw error;
  },

  /** Set (or clear) a card's due date — 'YYYY-MM-DD' or null. */
  async setTaskDue(taskId: string, dueDate: string | null): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('tasks').update({ due_date: dueDate }).eq('id', taskId);
    if (error) throw error;
  },

  /** Comments on a card, oldest first (RLS: staff all, assignee own cards). */
  async listTaskComments(taskId: string): Promise<Array<Record<string, unknown>>> {
    const { requireSupabase } = await import('../lib/supabase');
    const { data: rows, error } = await requireSupabase()
      .from('task_comments')
      .select('id, body, created_at, author:profiles!task_comments_author_id_fkey(name)')
      .eq('task_id', taskId)
      .order('created_at');
    if (error) throw error;
    return rows ?? [];
  },

  async addTaskComment(taskId: string, body: string): Promise<void> {
    const userId = await currentUserId();
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase()
      .from('task_comments')
      .insert({ task_id: taskId, author_id: userId, body });
    if (error) throw error;
  },

  /** Set a member's team role label (admin profile-update RLS). */
  async adminSetRole(profileId: string, role: string | null): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('profiles').update({ team_role: role }).eq('id', profileId);
    if (error) throw error;
  },

  /** Team sign-in with email + password (needs "Confirm email" OFF for instant accounts). */
  async teamSignIn(email: string, password: string): Promise<boolean> {
    if (!isBackendEnabled) return false;
    let session = await auth.signInWithPassword(email, password).catch(() => null);
    if (!session) session = await auth.signUpWithPassword(email, password);
    return Boolean(session);
  },

  /** Email a reset link that lands back on this app. */
  async requestPasswordReset(email: string): Promise<void> {
    if (!isBackendEnabled) throw new Error('backend not configured');
    await auth.requestPasswordReset(email, window.location.origin + window.location.pathname);
  },

  /* --------------------------------- Admin --------------------------------- */

  /** All members, newest first (profiles are public-read). */
  async adminListMembers(): Promise<Array<Record<string, unknown>>> {
    const { requireSupabase } = await import('../lib/supabase');
    const { data: rows, error } = await requireSupabase()
      .from('profiles')
      .select('id, name, city, rank_index, balance, activity_coins, created_at, is_staff, team_role')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return rows ?? [];
  },

  /** Grant/deduct coins for a member (admin_grant RPC, admin-gated in SQL). */
  async adminGrant(profileId: string, amount: number, label: string): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().rpc('admin_grant', {
      p_profile: profileId,
      p_amount: Math.round(amount),
      p_label: label,
    });
    if (error) throw error;
  },

  /** Set a member's rank (admin_set_rank RPC). */
  async adminSetRank(profileId: string, rank: number): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().rpc('admin_set_rank', {
      p_profile: profileId,
      p_rank: rank,
    });
    if (error) throw error;
  },

  /** Post a brief to the Pool (admins post as the house). */
  async adminAddBrief(input: {
    title: string;
    org: string;
    cat: string;
    budget: number;
    summary: string;
  }): Promise<void> {
    const userId = await currentUserId();
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase().from('pool_briefs').insert({
      title: input.title,
      org: input.org,
      cat: ['Branding', 'Production', 'Tech', 'Marketing'].includes(input.cat)
        ? input.cat
        : 'Branding',
      budget: Math.round(input.budget),
      summary: input.summary,
      posted_by: userId,
      status: 'open',
    });
    if (error) throw error;
  },

  /** Close a brief (admin RLS policy allows the update). */
  async adminCloseBrief(briefId: string): Promise<void> {
    const { requireSupabase } = await import('../lib/supabase');
    const { error } = await requireSupabase()
      .from('pool_briefs')
      .update({ status: 'closed' })
      .eq('id', briefId);
    if (error) throw error;
  },

  /** DB project row (+milestones/members/roles) → the UI workspace shape. */
  mapProject(row: Record<string, unknown>, me?: string | null): Record<string, unknown> {
    const ms = ((row.project_milestones as Array<Record<string, unknown>>) ?? [])
      .slice()
      .sort((a, b) => Number(a.sort) - Number(b.sort));
    const firstOpen = ms.findIndex((m) => !m.released);
    const members = (row.project_members as Array<Record<string, unknown>>) ?? [];
    const seats = (row.project_roles as Array<Record<string, unknown>>) ?? [];
    const isOwner = !me || String(row.owner_id ?? '') === me;
    const myMembership = members.find((m) => String(m.profile_id) === me);
    const myRole = myMembership ? String(myMembership.role ?? 'Member') : 'Member';
    const team = members
      .filter((m) => String(m.role ?? '') !== 'poster')
      .map((m) => ({
        name:
          String(m.profile_id) === me
            ? 'You'
            : String((m.profiles as Record<string, unknown> | null)?.name ?? 'Member'),
        role: String(m.role ?? 'Member'),
        you: String(m.profile_id) === me,
      }));
    return {
      id: String(row.id),
      title: String(row.title),
      poster: isOwner ? 'You' : 'Poster',
      cat: String(row.cat ?? 'Branding'),
      you: isOwner ? 'poster' : 'member',
      role: isOwner ? 'Poster' : myRole,
      stage: Number(row.stage ?? 1),
      budget: Number(row.budget ?? 0),
      escrowReleased: ms.filter((m) => m.released).reduce((s, m) => s + Number(m.amount), 0),
      deadline: 'Open',
      team,
      seats: seats.map((s) => ({
        role: String(s.role),
        sharePct: Number(s.share_pct ?? 0),
        filled: String(s.status) === 'filled',
      })),
      clientToken: (row.client_token as string | null) ?? null,
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

  // Password-recovery landing: the emailed reset link signs the user into a
  // temporary recovery session and fires this event — set the new password.
  if (isBackendEnabled) {
    auth.onAuthChange((event) => {
      if (event !== 'PASSWORD_RECOVERY') return;
      const pw = window.prompt('Welcome back — set a new password (8+ characters):');
      if (!pw || pw.length < 8) return;
      auth
        .updatePassword(pw)
        .then(() => window.alert('Password updated — you are signed in.'))
        .catch((e) => window.alert('Could not update password: ' + String(e?.message ?? e)));
    });
  }
}
