import { requireSupabase } from '../lib/supabase';

/**
 * Data service — typed read/write helpers over the BeingCamp schema.
 *
 * These map 1:1 to the tables in `supabase/migrations`. Screens migrate off the
 * legacy localStorage controller and onto these calls one at a time; until a
 * screen is migrated it keeps using demo data, so the app is always runnable.
 *
 * Every function assumes the backend is configured (guarded by `requireSupabase`).
 * Call them only when `isBackendEnabled` is true.
 */

/* ----------------------------- Public catalog ----------------------------- */

export async function getCoinPacks() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('coin_packs').select('*').order('sort');
  if (error) throw error;
  return data;
}

export async function getProducts() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('products').select('*').order('sort');
  if (error) throw error;
  return data;
}

export async function getServices() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('services').select('*').order('sort');
  if (error) throw error;
  return data;
}

export async function getPoolBriefs() {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('pool_briefs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPublications() {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('publications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getZones() {
  const sb = requireSupabase();
  const { data, error } = await sb.from('zones').select('*');
  if (error) throw error;
  return data;
}

export async function getWorkshops() {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('workshops')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* -------------------------------- Profile --------------------------------- */

export async function getMyProfile(userId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(userId: string, patch: Record<string, unknown>) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfileByName(name: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('profiles').select('*').eq('name', name).maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------------------------- Wallet / ledger ----------------------------- */

export async function getTransactions(profileId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Adjust a member's balance and write a ledger row.
 *
 * NOTE: For production this belongs in a Postgres RPC / edge function so the
 * balance update and the ledger insert are atomic and server-authoritative.
 * See supabase/README.md → "Next steps". This client version is fine for the MVP.
 */
export async function recordTransaction(input: {
  profileId: string;
  label: string;
  amount: number;
  ref: string;
}) {
  const sb = requireSupabase();
  const { data: profile, error: pErr } = await sb
    .from('profiles')
    .select('balance, activity_coins')
    .eq('id', input.profileId)
    .single();
  if (pErr) throw pErr;

  const balance = Number((profile as { balance?: number }).balance ?? 0) + input.amount;
  const activity =
    Number((profile as { activity_coins?: number }).activity_coins ?? 0) +
    (input.amount > 0 ? input.amount : 0);

  const { error: uErr } = await sb
    .from('profiles')
    .update({ balance, activity_coins: activity })
    .eq('id', input.profileId);
  if (uErr) throw uErr;

  const { data, error } = await sb
    .from('transactions')
    .insert({
      profile_id: input.profileId,
      label: input.label,
      amount: input.amount,
      ref: input.ref,
    })
    .select()
    .single();
  if (error) throw error;
  return { transaction: data, balance };
}

/* --------------------------- Orders & activity ---------------------------- */

export async function getOrders(profileId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('orders')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createOrder(order: Record<string, unknown>) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('orders').insert(order).select().single();
  if (error) throw error;
  return data;
}

export async function getNotifications(profileId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id: string) {
  const sb = requireSupabase();
  const { error } = await sb.from('notifications').update({ unread: false }).eq('id', id);
  if (error) throw error;
}

/* ------------------------------- Projects --------------------------------- */

export async function getMyProjects(profileId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('projects')
    .select('*, project_members(*), project_milestones(*)')
    .or(`owner_id.eq.${profileId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function rsvpWorkshop(workshopId: string, profileId: string) {
  const sb = requireSupabase();
  const { error } = await sb
    .from('workshop_rsvps')
    .insert({ workshop_id: workshopId, profile_id: profileId });
  if (error) throw error;
}

export async function checkInZone(zoneId: string, profileId: string) {
  const sb = requireSupabase();
  const { error } = await sb
    .from('zone_checkins')
    .insert({ zone_id: zoneId, profile_id: profileId });
  if (error) throw error;
}
