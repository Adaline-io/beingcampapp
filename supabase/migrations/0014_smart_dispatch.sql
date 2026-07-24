-- =============================================================================
-- BeingCamp — 0014_smart_dispatch.sql
-- Make claiming safe and fair (the "driver rating" layer):
--   * claim_role v2   — enforces the seat's rank gate, blocks a second seat
--                       on the same project, blocks re-claiming when already
--                       a member
--   * unclaim_role    — a member leaves a seat before work is released
--   * release_seat    — the poster kicks an unproductive claimant (reopens it)
--   * member_stats    — reliability: delivered count, avg score, on-time-ness,
--                       exposed publicly for crew-call trust
-- =============================================================================

-- ── claim_role v2: rank gate + one-seat-per-project ──────────────────────
create or replace function public.claim_role(p_role_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.project_roles%rowtype;
  v_rank int;
begin
  if v_uid is null then raise exception 'claim_role: not authenticated'; end if;

  select * into v_role from public.project_roles where id = p_role_id for update;
  if not found then raise exception 'claim_role: role not found'; end if;
  if v_role.status <> 'open' then raise exception 'claim_role: seat already filled'; end if;

  if exists (select 1 from public.projects p where p.id = v_role.project_id and p.owner_id = v_uid) then
    raise exception 'claim_role: you posted this project';
  end if;
  -- One seat per member per project — no stacking shares.
  if exists (select 1 from public.project_members m
              where m.project_id = v_role.project_id and m.profile_id = v_uid) then
    raise exception 'claim_role: you are already on this project';
  end if;
  -- Rank gate: lead/high-trust seats need a proven member.
  select rank_index into v_rank from public.profiles where id = v_uid;
  if coalesce(v_rank, 0) < coalesce(v_role.min_rank, 0) then
    raise exception 'claim_role: this seat needs a higher rank';
  end if;

  update public.project_roles set filled_by = v_uid, status = 'filled' where id = p_role_id;
  insert into public.project_members (project_id, profile_id, role)
  values (v_role.project_id, v_uid, v_role.role)
  on conflict (project_id, profile_id) do update set role = excluded.role;

  return json_build_object('project_id', v_role.project_id, 'role', v_role.role);
end;
$$;

revoke execute on function public.claim_role(uuid) from public, anon;
grant  execute on function public.claim_role(uuid) to authenticated;

-- ── unclaim_role: a member steps off a seat (only before they've earned) ─
create or replace function public.unclaim_role(p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.project_roles%rowtype;
begin
  if v_uid is null then raise exception 'unclaim_role: not authenticated'; end if;
  select * into v_role from public.project_roles where id = p_role_id for update;
  if not found then raise exception 'unclaim_role: not found'; end if;
  if v_role.filled_by is distinct from v_uid then
    raise exception 'unclaim_role: not your seat';
  end if;
  -- Can't walk away once you've been paid on this project.
  if exists (select 1 from public.project_completions c
              where c.project_id = v_role.project_id and c.profile_id = v_uid and c.coins_earned > 0) then
    raise exception 'unclaim_role: you have already earned on this project';
  end if;

  update public.project_roles set status = 'open', filled_by = null where id = p_role_id;
  delete from public.project_members
    where project_id = v_role.project_id and profile_id = v_uid and role <> 'poster';
end;
$$;

revoke execute on function public.unclaim_role(uuid) from public, anon;
grant  execute on function public.unclaim_role(uuid) to authenticated;

-- ── release_seat: the poster kicks a claimant and reopens the seat ───────
create or replace function public.release_seat(p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_role  public.project_roles%rowtype;
  v_owner uuid;
begin
  if v_uid is null then raise exception 'release_seat: not authenticated'; end if;
  select * into v_role from public.project_roles where id = p_role_id for update;
  if not found then raise exception 'release_seat: not found'; end if;
  select owner_id into v_owner from public.projects where id = v_role.project_id;
  if v_owner is distinct from v_uid and not public.is_admin() then
    raise exception 'release_seat: only the poster (or an admin) can release a seat';
  end if;
  if exists (select 1 from public.project_completions c
              where c.project_id = v_role.project_id and c.profile_id = v_role.filled_by and c.coins_earned > 0) then
    raise exception 'release_seat: that member has already earned — cannot remove';
  end if;

  delete from public.project_members
    where project_id = v_role.project_id and profile_id = v_role.filled_by and role <> 'poster';
  update public.project_roles set status = 'open', filled_by = null where id = p_role_id;
end;
$$;

revoke execute on function public.release_seat(uuid) from public, anon;
grant  execute on function public.release_seat(uuid) to authenticated;

-- ── member_stats: the reliability signal (public — it builds trust) ──────
create or replace function public.member_stats(p_profile uuid)
returns json
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select json_build_object(
    'delivered',  coalesce(count(*) filter (where completed), 0),
    'in_progress',coalesce(count(*) filter (where not completed), 0),
    'earned',     coalesce(sum(coins_earned), 0),
    'avg_score',  round(coalesce(avg(score) filter (where score is not null), 0), 2),
    'rated',      coalesce(count(*) filter (where score is not null), 0)
  )
  from public.project_completions where profile_id = p_profile;
$$;

grant execute on function public.member_stats(uuid) to anon, authenticated;
