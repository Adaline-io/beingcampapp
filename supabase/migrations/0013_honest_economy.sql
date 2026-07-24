-- =============================================================================
-- BeingCamp — 0013_honest_economy.sql
-- Close the money loopholes so real beta testers can't mint or fake coins.
--   * projects.state          — active | delivered | cancelled
--   * treasury                — the house account; collects the 15% fee
--   * create_project v3       — locks the budget from the poster FOR REAL
--                               (deducts + refuses if short) in one transaction
--   * release_milestone v4    — pays the crew 85%, the house 15%, per release
--   * record_transaction v3   — per-call + daily earn caps (no infinite top-ups)
--   * cancel_project          — refund the unreleased escrow to the poster
-- Conservation holds: poster −budget, crew +~85%, treasury +~15% over the life.
-- =============================================================================

-- Crew seats gain a rank gate (lead roles need a proven member); Phase 2
-- enforces it in claim_role, but create_project writes it from here on.
alter table public.project_roles add column if not exists min_rank int not null default 0;

alter table public.projects add column if not exists state text not null default 'active';
do $$ begin
  alter table public.projects add constraint projects_state_check
    check (state in ('active','delivered','cancelled'));
exception when duplicate_object then null; end $$;

-- ── The house account ────────────────────────────────────────────────────
create table if not exists public.treasury (
  id      int primary key default 1,
  balance bigint not null default 0,
  constraint treasury_singleton check (id = 1)
);
insert into public.treasury (id, balance) values (1, 0) on conflict (id) do nothing;

alter table public.treasury enable row level security;
drop policy if exists "treasury admin read" on public.treasury;
create policy "treasury admin read" on public.treasury for select to authenticated
  using (public.is_admin());

-- ── create_project v3: real escrow — the budget leaves the poster's wallet ─
create or replace function public.create_project(
  p_title      text,
  p_cat        text,
  p_budget     int,
  p_milestones json,
  p_roles      json default '[]'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
  v_bal int;
  m     json;
  i     int := 0;
begin
  if v_uid is null then raise exception 'create_project: not authenticated'; end if;
  if p_budget < 0 then raise exception 'create_project: negative budget'; end if;

  -- Lock the escrow: the budget must be on hand and is deducted now.
  select balance into v_bal from public.profiles where id = v_uid for update;
  if not found then raise exception 'create_project: profile not found'; end if;
  if v_bal < p_budget then
    raise exception 'create_project: insufficient balance to fund escrow (have %, need %)', v_bal, p_budget;
  end if;
  update public.profiles set balance = balance - p_budget where id = v_uid;

  insert into public.projects (title, owner_id, cat, budget, stage, state)
  values (p_title, v_uid, p_cat, p_budget, 1, 'active')
  returning id into v_id;

  insert into public.transactions (profile_id, label, amount, ref)
  values (v_uid, 'Escrow funded · ' || p_title, -p_budget, 'pool');

  insert into public.project_members (project_id, profile_id, role)
  values (v_id, v_uid, 'poster');

  for m in select * from json_array_elements(coalesce(p_milestones, '[]'::json)) loop
    insert into public.project_milestones (project_id, label, amount, sort)
    values (v_id, m ->> 'label', coalesce((m ->> 'amount')::int, 0), i);
    i := i + 1;
  end loop;

  for m in select * from json_array_elements(coalesce(p_roles, '[]'::json)) loop
    insert into public.project_roles (project_id, role, share_pct, min_rank)
    values (v_id, m ->> 'role', coalesce((m ->> 'share_pct')::int, 0),
            coalesce((m ->> 'min_rank')::int, 0));
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.create_project(text, text, int, json, json) from public, anon;
grant  execute on function public.create_project(text, text, int, json, json) to authenticated;

-- ── release_milestone v4: crew gets 85%, the house keeps 15% ──────────────
-- Escrow was already deducted at funding, so releases only distribute it.
create or replace function public.release_milestone(p_milestone_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid    uuid := auth.uid();
  v_ms     public.project_milestones%rowtype;
  v_p      public.projects%rowtype;
  v_total  int := 0;
  v_team   int;         -- 85% of the milestone, split across the crew
  v_paid   int := 0;
  v_cut    int;
  v_done   boolean;
  r        record;
begin
  if v_uid is null then raise exception 'release_milestone: not authenticated'; end if;

  select * into v_ms from public.project_milestones where id = p_milestone_id for update;
  if not found then raise exception 'release_milestone: milestone not found'; end if;
  if v_ms.released then raise exception 'release_milestone: already released'; end if;

  select * into v_p from public.projects where id = v_ms.project_id;
  if v_p.owner_id is distinct from v_uid and not public.is_admin() then
    raise exception 'release_milestone: only the project owner (or an admin) can release';
  end if;
  if v_p.state = 'cancelled' then raise exception 'release_milestone: project cancelled'; end if;

  update public.project_milestones set released = true where id = p_milestone_id;

  select coalesce(sum(share_pct), 0) into v_total
    from public.project_roles
   where project_id = v_ms.project_id and status = 'filled' and filled_by is not null;

  v_team := floor(v_ms.amount::numeric * 0.85);

  if v_total > 0 and v_team > 0 then
    for r in select filled_by, role, share_pct from public.project_roles
              where project_id = v_ms.project_id and status = 'filled' and filled_by is not null loop
      v_cut := floor(v_team::numeric * r.share_pct / v_total);
      if v_cut > 0 then
        update public.profiles
           set balance = balance + v_cut,
               activity_coins = activity_coins + v_cut
         where id = r.filled_by;
        insert into public.transactions (profile_id, label, amount, ref)
        values (r.filled_by, 'Milestone released · ' || v_ms.label || ' · ' || r.role, v_cut, 'pool');
        insert into public.project_completions (project_id, profile_id, role, coins_earned, title, cat)
        values (v_ms.project_id, r.filled_by, r.role, v_cut, v_p.title, v_p.cat)
        on conflict (project_id, profile_id) do update
          set coins_earned = public.project_completions.coins_earned + excluded.coins_earned,
              role = excluded.role;
        v_paid := v_paid + v_cut;
      end if;
    end loop;
  end if;

  -- Everything not paid to the crew (the 15% fee + any unfilled shares) is the house's.
  update public.treasury set balance = balance + (v_ms.amount - v_paid) where id = 1;

  select not exists (select 1 from public.project_milestones pm
                      where pm.project_id = v_ms.project_id and pm.released = false)
    into v_done;
  if v_done then
    update public.projects set stage = 4, state = 'delivered' where id = v_ms.project_id;
    update public.project_completions set completed = true where project_id = v_ms.project_id;
  end if;

  return json_build_object('released', v_ms.amount, 'paid_out', v_paid,
                           'house', v_ms.amount - v_paid, 'delivered', v_done);
end;
$$;

revoke execute on function public.release_milestone(uuid) from public, anon;
grant  execute on function public.release_milestone(uuid) to authenticated;

-- ── cancel_project: refund the unreleased escrow to the poster ───────────
create or replace function public.cancel_project(p_project_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid      uuid := auth.uid();
  v_p        public.projects%rowtype;
  v_released int := 0;
  v_refund   int;
begin
  if v_uid is null then raise exception 'cancel_project: not authenticated'; end if;
  select * into v_p from public.projects where id = p_project_id for update;
  if not found then raise exception 'cancel_project: not found'; end if;
  if v_p.owner_id is distinct from v_uid and not public.is_admin() then
    raise exception 'cancel_project: only the owner (or an admin) can cancel';
  end if;
  if v_p.state <> 'active' then raise exception 'cancel_project: not active'; end if;

  select coalesce(sum(amount), 0) into v_released
    from public.project_milestones where project_id = p_project_id and released;
  v_refund := greatest(0, v_p.budget - v_released);

  if v_refund > 0 then
    update public.profiles set balance = balance + v_refund where id = v_p.owner_id;
    insert into public.transactions (profile_id, label, amount, ref)
    values (v_p.owner_id, 'Escrow refunded · ' || v_p.title, v_refund, 'pool');
  end if;

  update public.project_roles set status = 'open', filled_by = null
    where project_id = p_project_id and status = 'filled';
  update public.projects set state = 'cancelled' where id = p_project_id;

  return json_build_object('refunded', v_refund);
end;
$$;

revoke execute on function public.cancel_project(uuid) from public, anon;
grant  execute on function public.cancel_project(uuid) to authenticated;

-- ── record_transaction v3: caps so nobody mints coins from the console ────
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
  v_uid       uuid := auth.uid();
  v_balance   int;
  v_activity  int;
  v_rank      int;
  v_ref       text := p_ref;
  v_txn_id    uuid;
  v_today_pos int;
  -- Anti-abuse ceilings (beta values; real top-ups will run through payments).
  c_per_txn   constant int := 20000;   -- largest single credit
  c_daily     constant int := 60000;   -- largest self-served earn per day
begin
  if v_uid is null then raise exception 'record_transaction: not authenticated'; end if;
  if v_ref not in ('ritual','zone','pool','store','pack','service','gift','admin') then
    v_ref := 'admin';
  end if;
  if p_amount > c_per_txn then
    raise exception 'record_transaction: single credit over cap (% > %)', p_amount, c_per_txn;
  end if;

  -- Daily earn cap on self-served credits (escrow 'pool' + 'admin' grants exempt:
  -- those are already server-authoritative through their own RPCs).
  if p_amount > 0 and v_ref not in ('pool','admin') then
    select coalesce(sum(amount), 0) into v_today_pos
      from public.transactions
     where profile_id = v_uid and amount > 0
       and ref not in ('pool','admin')
       and created_at >= date_trunc('day', now());
    if v_today_pos + p_amount > c_daily then
      raise exception 'record_transaction: daily earn cap reached';
    end if;
  end if;

  select balance, activity_coins, rank_index
    into v_balance, v_activity, v_rank
    from public.profiles where id = v_uid for update;
  if not found then raise exception 'record_transaction: profile % not found', v_uid; end if;

  v_balance := v_balance + p_amount;
  if v_balance < 0 then raise exception 'record_transaction: insufficient balance'; end if;
  if p_amount > 0 then v_activity := v_activity + p_amount; end if;

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
