-- =============================================================================
-- BeingCamp — 0001_init.sql
-- Full database schema for the BeingCamp creative-community app.
--
-- Currency: "BeingCoin" (BC), an in-app soft currency stored as integers.
-- Auth: 1:1 with Supabase auth.users via public.profiles.
-- =============================================================================

-- Required for gen_random_uuid().
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Shared trigger helper: keep updated_at fresh.
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- profiles — 1:1 with auth.users. Public creative portfolio + wallet balances.
-- =============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text,
  accent        text        not null default '#c9a84c',   -- hex brand color
  city          text,
  headline      text,
  bio           text,
  skills        text[]      not null default '{}',
  path          text,                                       -- 'maker' | 'builder' | ...
  rank_index    int         not null default 0,             -- 0 Visitor..4 Chief
  balance       int         not null default 100,           -- spendable BeingCoin
  activity_coins int        not null default 100,            -- earnable / activity BC
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_rank_index_range check (rank_index between 0 and 4)
);

comment on table public.profiles is 'Public member profile, 1:1 with auth.users. Holds wallet balances and portfolio info.';
comment on column public.profiles.rank_index is '0 Visitor, 1 Recruit, 2 Builder, 3 Maker, 4 Chief';
comment on column public.profiles.balance is 'Spendable BeingCoin (BC) balance.';

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-provision a profile row when a new auth.users row is created.
-- Runs as the auth trigger owner; reads the display name from signup metadata.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- transactions — wallet ledger (append-only in practice).
-- =============================================================================
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  label       text        not null,
  amount      int         not null,   -- positive = earn/credit, negative = spend/debit
  ref         text        not null,   -- 'ritual'|'zone'|'pool'|'store'|'pack'|'service'|'gift'|'admin'
  created_at  timestamptz not null default now(),
  constraint transactions_ref_check check (
    ref in ('ritual','zone','pool','store','pack','service','gift','admin')
  )
);

comment on table public.transactions is 'Per-user BeingCoin ledger. amount is signed (+earn / -spend).';
create index if not exists transactions_profile_created_idx
  on public.transactions (profile_id, created_at desc);

-- =============================================================================
-- coin_packs — static catalog of purchasable BeingCoin bundles.
-- =============================================================================
create table if not exists public.coin_packs (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  coins       int         not null,   -- base coins granted
  bonus       int         not null default 0,
  price_cents int         not null,   -- real-money price in cents
  sort        int         not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.coin_packs is 'Static catalog of real-money BeingCoin top-up packs.';

-- =============================================================================
-- products — store items (physical goods, passes, digital).
-- =============================================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  source      text        not null,   -- seller / brand
  bc          int         not null,   -- price in BeingCoin
  tone        text        not null default '#c9a84c',  -- hex accent
  cat         text,                                     -- category
  type        text        not null default 'physical',
  description text,
  sort        int         not null default 0,
  created_at  timestamptz not null default now(),
  constraint products_type_check check (type in ('physical','pass','digital'))
);

comment on table public.products is 'Marketplace store items priced in BeingCoin.';

-- =============================================================================
-- services — professional services offered by members / partners.
-- =============================================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  provider    text        not null,
  bc          int         not null,   -- price in BeingCoin
  cat         text,
  description text,
  sort        int         not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.services is 'Professional services bookable with BeingCoin.';

-- =============================================================================
-- pool_briefs — open work / gigs in "The Pool".
-- =============================================================================
create table if not exists public.pool_briefs (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  org         text        not null,
  cat         text        not null,   -- Branding|Production|Tech|Marketing
  budget      int         not null,   -- BeingCoin budget
  summary     text,
  posted_by   uuid        references public.profiles (id) on delete set null,
  status      text        not null default 'open',
  created_at  timestamptz not null default now(),
  constraint pool_briefs_cat_check check (cat in ('Branding','Production','Tech','Marketing')),
  constraint pool_briefs_status_check check (status in ('open','matched','closed'))
);

comment on table public.pool_briefs is 'Open briefs / gigs posted to The Pool.';
create index if not exists pool_briefs_status_idx on public.pool_briefs (status, created_at desc);

-- =============================================================================
-- projects — collaboration workspaces.
-- =============================================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  owner_id    uuid        not null references public.profiles (id) on delete cascade,
  stage       int         not null default 0,   -- 0..4 lifecycle stage
  tone        text        not null default '#c9a84c',
  summary     text,
  created_at  timestamptz not null default now(),
  constraint projects_stage_range check (stage between 0 and 4)
);

comment on table public.projects is 'Collaboration workspaces owned by a member.';

-- project_members — who belongs to a project and in what role.
create table if not exists public.project_members (
  project_id  uuid        not null references public.projects (id) on delete cascade,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  role        text        not null default 'member',
  created_at  timestamptz not null default now(),
  primary key (project_id, profile_id)
);

comment on table public.project_members is 'Membership + role mapping between profiles and projects.';
create index if not exists project_members_profile_idx on public.project_members (profile_id);

-- project_milestones — escrowed BeingCoin milestones inside a project.
create table if not exists public.project_milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid        not null references public.projects (id) on delete cascade,
  label       text        not null,
  amount      int         not null default 0,   -- BeingCoin held in escrow
  released    boolean     not null default false,
  sort        int         not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.project_milestones is 'BeingCoin escrow milestones for a project.';
create index if not exists project_milestones_project_idx on public.project_milestones (project_id, sort);

-- =============================================================================
-- publications — Showcase case studies / work / theory.
-- =============================================================================
create table if not exists public.publications (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid        references public.profiles (id) on delete set null,
  author      text        not null,   -- display name (denormalized for guest authors)
  title       text        not null,
  kind        text        not null default 'Case Study',
  summary     text,
  tone        text        not null default '#c9a84c',
  created_at  timestamptz not null default now(),
  constraint publications_kind_check check (kind in ('Case Study','Work','Theory'))
);

comment on table public.publications is 'Showcase publications: case studies, work, and theory pieces.';

-- =============================================================================
-- zones — physical check-in spaces (slug PK).
-- =============================================================================
create table if not exists public.zones (
  id          text primary key,        -- slug: 'room' | 'camp' | 'inner'
  name        text        not null,
  description text,
  bookable    boolean     not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.zones is 'Physical spaces members can check into.';

-- zone_checkins — per-user check-in events.
create table if not exists public.zone_checkins (
  id          uuid primary key default gen_random_uuid(),
  zone_id     text        not null references public.zones (id) on delete cascade,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.zone_checkins is 'Check-in events for zones.';
create index if not exists zone_checkins_profile_idx on public.zone_checkins (profile_id, created_at desc);

-- =============================================================================
-- workshops — programs / sessions members can RSVP to.
-- =============================================================================
create table if not exists public.workshops (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  host        text        not null,   -- display host name
  host_id     uuid        references public.profiles (id) on delete set null,
  when_text   text,                    -- e.g. 'Thu 7pm'
  date_text   text,                    -- e.g. 'Jul 18'
  zone_id     text        references public.zones (id) on delete set null,
  cost        int         not null default 0,   -- BeingCoin cost to attend
  seats       int         not null default 0,
  taken       int         not null default 0,
  tag         text,
  tone        text        not null default '#c9a84c',
  description text,
  created_at  timestamptz not null default now()
);

comment on table public.workshops is 'Programs / workshops with seats and BeingCoin cost.';

-- workshop_rsvps — who is attending a workshop.
create table if not exists public.workshop_rsvps (
  workshop_id uuid        not null references public.workshops (id) on delete cascade,
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (workshop_id, profile_id)
);

comment on table public.workshop_rsvps is 'RSVP mapping between profiles and workshops.';
create index if not exists workshop_rsvps_profile_idx on public.workshop_rsvps (profile_id);

-- =============================================================================
-- orders — purchases (store items, passes) with tracking stage.
-- =============================================================================
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  ref         text        not null default ('#BC-' || (floor(random() * 9000) + 1000)::int::text),
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  item        text        not null,
  source      text,
  bc          int         not null,   -- BeingCoin spent
  tone        text        not null default '#c9a84c',
  type        text        not null default 'physical',
  stage       int         not null default 0,   -- 0..4 fulfillment tracking
  created_at  timestamptz not null default now(),
  constraint orders_type_check check (type in ('physical','pass')),
  constraint orders_stage_range check (stage between 0 and 4)
);

comment on table public.orders is 'Member purchases with human-readable ref and tracking stage.';
comment on column public.orders.ref is 'Human-friendly order reference like #BC-2042.';
create index if not exists orders_profile_idx on public.orders (profile_id, created_at desc);

-- =============================================================================
-- notifications — per-user in-app notifications.
-- =============================================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid        not null references public.profiles (id) on delete cascade,
  ic          text,                    -- icon key
  tone        text,                    -- accent tone
  title       text        not null,
  body        text,
  cta         text,                    -- target screen route
  unread      boolean     not null default true,
  grp         text        not null default 'Today',   -- 'Today' | 'Earlier'
  created_at  timestamptz not null default now(),
  constraint notifications_grp_check check (grp in ('Today','Earlier'))
);

comment on table public.notifications is 'Per-user in-app notifications feed.';
create index if not exists notifications_profile_idx on public.notifications (profile_id, created_at desc);

-- =============================================================================
-- referrals — invite tracking.
-- =============================================================================
create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid        not null references public.profiles (id) on delete cascade,
  code          text        not null unique,
  invited_email text,
  joined        boolean     not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.referrals is 'Referral codes and invite conversion tracking.';
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
