-- =============================================================================
-- BeingCamp — 0005_shared_data_loop.sql
-- Server-side economy for the shared data loop:
--   * zones gain cost / min_rank; full 6-zone catalog upserted
--   * projects gain cat / budget
--   * record_checkin(zone)        — rank-gated, charges the zone cost, logs it
--   * create_project(...)         — project + milestones + poster membership
--   * release_milestone(id)       — owner-only, pays project members from escrow
-- All money movement stays inside Postgres, keyed on auth.uid().
-- =============================================================================

alter table public.zones add column if not exists cost int not null default 0;
alter table public.zones add column if not exists min_rank int not null default 0;

insert into public.zones (id, name, description, bookable, cost, min_rank) values
  ('front', 'The Front', 'Walk-in. The threshold.',            false, 0,   0),
  ('camp',  'The Camp',  'The working floor. Day passes.',     true,  30,  1),
  ('room',  'The Room',  'Scheduled immersive sessions.',      true,  50,  1),
  ('den',   'The Den',   'Members lounge. Where it loosens.',  false, 10,  1),
  ('stage', 'The Stage', 'Talks, Clash nights, The Fire.',     false, 20,  0),
  ('inner', 'The Inner', 'Private meeting. Maker & above.',    true,  150, 3)
on conflict (id) do update
  set name = excluded.name, description = excluded.description,
      bookable = excluded.bookable, cost = excluded.cost, min_rank = excluded.min_rank;

alter table public.projects add column if not exists cat text;
alter table public.projects add column if not exists budget int not null default 0;

-- -----------------------------------------------------------------------------
-- record_checkin: validate the zone + rank gate, charge the cost atomically,
-- write the check-in row. The client never decides what a check-in costs.
-- -----------------------------------------------------------------------------
create or replace function public.record_checkin(p_zone_id text)
returns json
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_zone public.zones%rowtype;
  v_rank int;
  v_result json;
begin
  if v_uid is null then raise exception 'record_checkin: not authenticated'; end if;

  select * into v_zone from public.zones where id = p_zone_id;
  if not found then raise exception 'record_checkin: unknown zone %', p_zone_id; end if;

  select rank_index into v_rank from public.profiles where id = v_uid;
  if v_rank is null or v_rank < v_zone.min_rank then
    raise exception 'record_checkin: rank too low for %', v_zone.name;
  end if;

  if v_zone.cost > 0 then
    v_result := public.record_transaction(v_zone.name || ' · check-in', -v_zone.cost, 'zone');
  end if;

  insert into public.zone_checkins (zone_id, profile_id) values (p_zone_id, v_uid);
  return coalesce(v_result, json_build_object('balance', null));
end;
$$;

revoke execute on function public.record_checkin(text) from public, anon;
grant  execute on function public.record_checkin(text) to authenticated;

-- -----------------------------------------------------------------------------
-- create_project: project + milestones + the poster's membership in one call.
-- p_milestones: [{"label": "...", "amount": 300}, ...]
-- -----------------------------------------------------------------------------
create or replace function public.create_project(
  p_title      text,
  p_cat        text,
  p_budget     int,
  p_milestones json
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
  m     json;
  i     int := 0;
begin
  if v_uid is null then raise exception 'create_project: not authenticated'; end if;
  if p_budget < 0 then raise exception 'create_project: negative budget'; end if;

  insert into public.projects (title, owner_id, cat, budget, stage)
  values (p_title, v_uid, p_cat, p_budget, 1)
  returning id into v_id;

  insert into public.project_members (project_id, profile_id, role)
  values (v_id, v_uid, 'poster');

  for m in select * from json_array_elements(coalesce(p_milestones, '[]'::json)) loop
    insert into public.project_milestones (project_id, label, amount, sort)
    values (v_id, m ->> 'label', coalesce((m ->> 'amount')::int, 0), i);
    i := i + 1;
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.create_project(text, text, int, json) from public, anon;
grant  execute on function public.create_project(text, text, int, json) to authenticated;

-- -----------------------------------------------------------------------------
-- release_milestone: only the project owner can release; pays the milestone
-- amount split across non-poster members (if any), all inside one transaction.
-- -----------------------------------------------------------------------------
create or replace function public.release_milestone(p_milestone_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_ms      public.project_milestones%rowtype;
  v_owner   uuid;
  v_members uuid[];
  v_share   int;
  v_m       uuid;
begin
  if v_uid is null then raise exception 'release_milestone: not authenticated'; end if;

  select * into v_ms from public.project_milestones where id = p_milestone_id for update;
  if not found then raise exception 'release_milestone: milestone not found'; end if;
  if v_ms.released then raise exception 'release_milestone: already released'; end if;

  select owner_id into v_owner from public.projects where id = v_ms.project_id;
  if v_owner is distinct from v_uid then
    raise exception 'release_milestone: only the project owner can release';
  end if;

  update public.project_milestones set released = true where id = p_milestone_id;

  select coalesce(array_agg(profile_id), '{}') into v_members
    from public.project_members
   where project_id = v_ms.project_id and role <> 'poster';

  if array_length(v_members, 1) > 0 and v_ms.amount > 0 then
    v_share := floor(v_ms.amount::numeric / array_length(v_members, 1));
    foreach v_m in array v_members loop
      update public.profiles
         set balance = balance + v_share,
             activity_coins = activity_coins + v_share
       where id = v_m;
      insert into public.transactions (profile_id, label, amount, ref)
      values (v_m, 'Milestone released · ' || v_ms.label, v_share, 'pool');
    end loop;
  end if;

  -- Close the project when everything is released.
  update public.projects p set stage = 4
   where p.id = v_ms.project_id
     and not exists (select 1 from public.project_milestones pm
                      where pm.project_id = p.id and pm.released = false);

  return json_build_object('released', v_ms.amount, 'members_paid', coalesce(array_length(v_members, 1), 0));
end;
$$;

revoke execute on function public.release_milestone(uuid) from public, anon;
grant  execute on function public.release_milestone(uuid) to authenticated;
