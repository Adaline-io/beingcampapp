-- =============================================================================
-- BeingCamp — 0002_rls.sql
-- Row Level Security policies.
--
-- Model:
--   * Public catalog tables      -> readable by everyone (anon + authenticated).
--   * profiles                   -> readable by everyone; writable only by owner.
--   * User-owned tables          -> full CRUD limited to the owning user.
--   * projects / milestones      -> members read; owner writes.
--
-- Ownership is checked with auth.uid() = <owner column>. For profiles the
-- profile id IS the auth user id, so auth.uid() = profiles.id.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on every table.
-- -----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.transactions        enable row level security;
alter table public.coin_packs          enable row level security;
alter table public.products            enable row level security;
alter table public.services            enable row level security;
alter table public.pool_briefs         enable row level security;
alter table public.projects            enable row level security;
alter table public.project_members     enable row level security;
alter table public.project_milestones  enable row level security;
alter table public.publications        enable row level security;
alter table public.zones               enable row level security;
alter table public.zone_checkins       enable row level security;
alter table public.workshops           enable row level security;
alter table public.workshop_rsvps      enable row level security;
alter table public.orders              enable row level security;
alter table public.notifications       enable row level security;
alter table public.referrals           enable row level security;

-- =============================================================================
-- PUBLIC CATALOG TABLES — SELECT for everyone (anon + authenticated).
-- These are read-only from the client; writes happen via admin / service role,
-- which bypasses RLS.
-- =============================================================================

-- coin_packs
drop policy if exists "coin_packs public read" on public.coin_packs;
create policy "coin_packs public read"
  on public.coin_packs for select
  to anon, authenticated
  using (true);

-- products
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  to anon, authenticated
  using (true);

-- services
drop policy if exists "services public read" on public.services;
create policy "services public read"
  on public.services for select
  to anon, authenticated
  using (true);

-- zones
drop policy if exists "zones public read" on public.zones;
create policy "zones public read"
  on public.zones for select
  to anon, authenticated
  using (true);

-- workshops
drop policy if exists "workshops public read" on public.workshops;
create policy "workshops public read"
  on public.workshops for select
  to anon, authenticated
  using (true);

-- pool_briefs
drop policy if exists "pool_briefs public read" on public.pool_briefs;
create policy "pool_briefs public read"
  on public.pool_briefs for select
  to anon, authenticated
  using (true);

-- publications
drop policy if exists "publications public read" on public.publications;
create policy "publications public read"
  on public.publications for select
  to anon, authenticated
  using (true);

-- =============================================================================
-- profiles — everyone can read (public portfolios); owner-only writes.
-- Inserts normally come from the handle_new_user trigger (security definer),
-- but we also allow a user to insert their own row for safety.
-- =============================================================================
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =============================================================================
-- USER-OWNED TABLES — select/insert/update limited to the owning user
-- via auth.uid() = profile_id.
-- =============================================================================

-- transactions
drop policy if exists "transactions owner select" on public.transactions;
create policy "transactions owner select"
  on public.transactions for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "transactions owner insert" on public.transactions;
create policy "transactions owner insert"
  on public.transactions for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "transactions owner update" on public.transactions;
create policy "transactions owner update"
  on public.transactions for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- orders
drop policy if exists "orders owner select" on public.orders;
create policy "orders owner select"
  on public.orders for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "orders owner insert" on public.orders;
create policy "orders owner insert"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "orders owner update" on public.orders;
create policy "orders owner update"
  on public.orders for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- notifications
drop policy if exists "notifications owner select" on public.notifications;
create policy "notifications owner select"
  on public.notifications for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "notifications owner insert" on public.notifications;
create policy "notifications owner insert"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "notifications owner update" on public.notifications;
create policy "notifications owner update"
  on public.notifications for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- referrals (owner = referrer_id)
drop policy if exists "referrals owner select" on public.referrals;
create policy "referrals owner select"
  on public.referrals for select
  to authenticated
  using (auth.uid() = referrer_id);

drop policy if exists "referrals owner insert" on public.referrals;
create policy "referrals owner insert"
  on public.referrals for insert
  to authenticated
  with check (auth.uid() = referrer_id);

drop policy if exists "referrals owner update" on public.referrals;
create policy "referrals owner update"
  on public.referrals for update
  to authenticated
  using (auth.uid() = referrer_id)
  with check (auth.uid() = referrer_id);

-- zone_checkins
drop policy if exists "zone_checkins owner select" on public.zone_checkins;
create policy "zone_checkins owner select"
  on public.zone_checkins for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "zone_checkins owner insert" on public.zone_checkins;
create policy "zone_checkins owner insert"
  on public.zone_checkins for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "zone_checkins owner update" on public.zone_checkins;
create policy "zone_checkins owner update"
  on public.zone_checkins for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- workshop_rsvps
drop policy if exists "workshop_rsvps owner select" on public.workshop_rsvps;
create policy "workshop_rsvps owner select"
  on public.workshop_rsvps for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "workshop_rsvps owner insert" on public.workshop_rsvps;
create policy "workshop_rsvps owner insert"
  on public.workshop_rsvps for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "workshop_rsvps owner update" on public.workshop_rsvps;
create policy "workshop_rsvps owner update"
  on public.workshop_rsvps for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- project_members (owner = the member row's profile_id)
drop policy if exists "project_members owner select" on public.project_members;
create policy "project_members owner select"
  on public.project_members for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "project_members owner insert" on public.project_members;
create policy "project_members owner insert"
  on public.project_members for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "project_members owner update" on public.project_members;
create policy "project_members owner update"
  on public.project_members for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- =============================================================================
-- projects / project_milestones
--   * Members (any profile in project_members) can SELECT.
--   * Only the project owner can INSERT / UPDATE.
-- =============================================================================

-- projects: a user is a "member" if they own it or appear in project_members.
drop policy if exists "projects member select" on public.projects;
create policy "projects member select"
  on public.projects for select
  to authenticated
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = projects.id
        and pm.profile_id = auth.uid()
    )
  );

drop policy if exists "projects owner insert" on public.projects;
create policy "projects owner insert"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "projects owner update" on public.projects;
create policy "projects owner update"
  on public.projects for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- project_milestones: visible to any project member; writable by project owner.
drop policy if exists "project_milestones member select" on public.project_milestones;
create policy "project_milestones member select"
  on public.project_milestones for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_milestones.project_id
        and (
          p.owner_id = auth.uid()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id
              and pm.profile_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "project_milestones owner insert" on public.project_milestones;
create policy "project_milestones owner insert"
  on public.project_milestones for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_milestones.project_id
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "project_milestones owner update" on public.project_milestones;
create policy "project_milestones owner update"
  on public.project_milestones for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_milestones.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_milestones.project_id
        and p.owner_id = auth.uid()
    )
  );

-- =============================================================================
-- pool_briefs — poster can update/close their own brief (read is public above).
-- =============================================================================
drop policy if exists "pool_briefs owner insert" on public.pool_briefs;
create policy "pool_briefs owner insert"
  on public.pool_briefs for insert
  to authenticated
  with check (auth.uid() = posted_by);

drop policy if exists "pool_briefs owner update" on public.pool_briefs;
create policy "pool_briefs owner update"
  on public.pool_briefs for update
  to authenticated
  using (auth.uid() = posted_by)
  with check (auth.uid() = posted_by);

-- =============================================================================
-- publications — author can create/update their own (read is public above).
-- =============================================================================
drop policy if exists "publications owner insert" on public.publications;
create policy "publications owner insert"
  on public.publications for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "publications owner update" on public.publications;
create policy "publications owner update"
  on public.publications for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
