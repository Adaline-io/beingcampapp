-- =============================================================================
-- BeingCamp — 0010_dispatch.sql
-- The dispatch marketplace: work is posted with open role slots, players claim
-- them Uber-style, milestone releases split the pot by each role's share, and
-- ranks level up automatically from earned activity. Clients get a read-only
-- window into their project via a share token.
-- =============================================================================

-- ── Open role slots on projects ("crew calls") ───────────────────────────
create table if not exists public.project_roles (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects (id) on delete cascade,
  role       text        not null,
  share_pct  int         not null default 0,      -- this seat's cut of each release
  filled_by  uuid        references public.profiles (id) on delete set null,
  status     text        not null default 'open',
  created_at timestamptz not null default now(),
  constraint project_roles_status_check check (status in ('open', 'filled')),
  constraint project_roles_share_range check (share_pct between 0 and 100)
);
create index if not exists project_roles_open_idx on public.project_roles (status, created_at desc);

alter table public.project_roles enable row level security;

drop policy if exists "roles public read" on public.project_roles;
create policy "roles public read" on public.project_roles for select to anon, authenticated using (true);

drop policy if exists "roles owner write" on public.project_roles;
create policy "roles owner write" on public.project_roles for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()) or public.is_staff())
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()) or public.is_staff());

-- ── Claim a seat (the "accept the ride" moment) ──────────────────────────
create or replace function public.claim_role(p_role_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid  uuid := auth.uid();
  v_role public.project_roles%rowtype;
begin
  if v_uid is null then raise exception 'claim_role: not authenticated'; end if;

  select * into v_role from public.project_roles where id = p_role_id for update;
  if not found then raise exception 'claim_role: role not found'; end if;
  if v_role.status <> 'open' then raise exception 'claim_role: seat already filled'; end if;
  if exists (select 1 from public.projects p where p.id = v_role.project_id and p.owner_id = v_uid) then
    raise exception 'claim_role: you posted this project';
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

-- ── create_project v2: also opens the crew-call seats ────────────────────
create or replace function public.create_project(
  p_title      text,
  p_cat        text,
  p_budget     int,
  p_milestones json,
  p_roles      json default '[]'
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

  for m in select * from json_array_elements(coalesce(p_roles, '[]'::json)) loop
    insert into public.project_roles (project_id, role, share_pct)
    values (v_id, m ->> 'role', coalesce((m ->> 'share_pct')::int, 0));
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.create_project(text, text, int, json, json) from public, anon;
grant  execute on function public.create_project(text, text, int, json, json) to authenticated;

-- ── release_milestone v2: split by each seat's share, not equally ────────
create or replace function public.release_milestone(p_milestone_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_ms    public.project_milestones%rowtype;
  v_owner uuid;
  v_total int := 0;
  v_paid  int := 0;
  v_cut   int;
  r       record;
begin
  if v_uid is null then raise exception 'release_milestone: not authenticated'; end if;

  select * into v_ms from public.project_milestones where id = p_milestone_id for update;
  if not found then raise exception 'release_milestone: milestone not found'; end if;
  if v_ms.released then raise exception 'release_milestone: already released'; end if;

  select owner_id into v_owner from public.projects where id = v_ms.project_id;
  if v_owner is distinct from v_uid and not public.is_admin() then
    raise exception 'release_milestone: only the project owner (or an admin) can release';
  end if;

  update public.project_milestones set released = true where id = p_milestone_id;

  select coalesce(sum(share_pct), 0) into v_total
    from public.project_roles
   where project_id = v_ms.project_id and status = 'filled' and filled_by is not null;

  if v_total > 0 and v_ms.amount > 0 then
    -- Weighted split across filled seats; ledger line per player.
    for r in select filled_by, role, share_pct from public.project_roles
              where project_id = v_ms.project_id and status = 'filled' and filled_by is not null loop
      v_cut := floor(v_ms.amount::numeric * r.share_pct / v_total);
      if v_cut > 0 then
        update public.profiles
           set balance = balance + v_cut,
               activity_coins = activity_coins + v_cut
         where id = r.filled_by;
        insert into public.transactions (profile_id, label, amount, ref)
        values (r.filled_by, 'Milestone released · ' || v_ms.label || ' · ' || r.role, v_cut, 'pool');
        v_paid := v_paid + v_cut;
      end if;
    end loop;
  end if;

  update public.projects p set stage = 4
   where p.id = v_ms.project_id
     and not exists (select 1 from public.project_milestones pm
                      where pm.project_id = p.id and pm.released = false);

  return json_build_object('released', v_ms.amount, 'paid_out', v_paid);
end;
$$;

revoke execute on function public.release_milestone(uuid) from public, anon;
grant  execute on function public.release_milestone(uuid) to authenticated;

-- ── Levels: ranks follow earned activity automatically ───────────────────
create or replace function public.record_transaction(
  p_label  text,
  p_amount int,
  p_ref    text
)
returns json
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid      uuid := auth.uid();
  v_balance  int;
  v_activity int;
  v_rank     int;
  v_ref      text := p_ref;
  v_txn_id   uuid;
begin
  if v_uid is null then raise exception 'record_transaction: not authenticated'; end if;
  if v_ref not in ('ritual','zone','pool','store','pack','service','gift','admin') then
    v_ref := 'admin';
  end if;

  select balance, activity_coins, rank_index
    into v_balance, v_activity, v_rank
    from public.profiles where id = v_uid for update;
  if not found then raise exception 'record_transaction: profile % not found', v_uid; end if;

  v_balance := v_balance + p_amount;
  if v_balance < 0 then raise exception 'record_transaction: insufficient balance'; end if;
  if p_amount > 0 then v_activity := v_activity + p_amount; end if;

  -- Level thresholds: Visitor 0 · Recruit 100 · Builder 1500 · Maker 5000 · Chief 15000
  v_rank := greatest(v_rank, case
    when v_activity >= 15000 then 4
    when v_activity >= 5000  then 3
    when v_activity >= 1500  then 2
    when v_activity >= 100   then 1
    else 0 end);

  update public.profiles
     set balance = v_balance, activity_coins = v_activity, rank_index = v_rank
   where id = v_uid;

  insert into public.transactions (profile_id, label, amount, ref)
  values (v_uid, p_label, p_amount, v_ref)
  returning id into v_txn_id;

  return json_build_object('transaction_id', v_txn_id, 'balance', v_balance,
                           'activity_coins', v_activity, 'rank_index', v_rank);
end;
$$;

-- ── Client window: token-scoped read-only project snapshot ───────────────
alter table public.projects add column if not exists client_token uuid not null default gen_random_uuid();

create or replace function public.client_project(p_token uuid)
returns json
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_p public.projects%rowtype;
begin
  select * into v_p from public.projects where client_token = p_token;
  if not found then return null; end if;
  return json_build_object(
    'title', v_p.title,
    'cat', v_p.cat,
    'stage', v_p.stage,
    'budget', v_p.budget,
    'milestones', (select coalesce(json_agg(json_build_object(
        'label', pm.label, 'amount', pm.amount, 'released', pm.released) order by pm.sort), '[]'::json)
      from public.project_milestones pm where pm.project_id = v_p.id),
    'team', (select coalesce(json_agg(json_build_object(
        'role', pr.role, 'filled', pr.status = 'filled') order by pr.created_at), '[]'::json)
      from public.project_roles pr where pr.project_id = v_p.id)
  );
end;
$$;

-- Clients follow a link with no account: anon may call, token is the secret.
grant execute on function public.client_project(uuid) to anon, authenticated;
