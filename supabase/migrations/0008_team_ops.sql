-- =============================================================================
-- BeingCamp — 0008_team_ops.sql
-- Internal-team layer: staff role, admin oversight, audit access.
--   * profiles.is_staff — scoping rights without money rights
--   * staff can write pool_briefs + workshops (run the work pipeline)
--   * admins can update any profile (rank/staff management from the app)
--   * admins can read the full ledger (audit view for grants & payouts)
-- =============================================================================

alter table public.profiles add column if not exists is_staff boolean not null default false;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select is_staff or is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

revoke execute on function public.is_staff() from public, anon;
grant  execute on function public.is_staff() to authenticated;

-- Staff run the work + programs pipeline.
drop policy if exists "pool_briefs staff write" on public.pool_briefs;
create policy "pool_briefs staff write" on public.pool_briefs for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "workshops staff write" on public.workshops;
create policy "workshops staff write" on public.workshops for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Admins manage members (rank, staff flag) directly.
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Admins can audit the whole ledger.
drop policy if exists "transactions admin read" on public.transactions;
create policy "transactions admin read" on public.transactions for select to authenticated
  using (public.is_admin());
