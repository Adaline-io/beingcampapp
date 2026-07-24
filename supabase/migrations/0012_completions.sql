-- =============================================================================
-- BeingCamp — 0012_completions.sql
-- The track record: every escrow release writes a per-member completion row
-- (project, role, coins earned). When the last milestone releases the row is
-- marked completed; the poster scores the crew (1–5) and the whole report —
-- delivered work, earnings, scores — shows on each member's profile.
-- =============================================================================

create table if not exists public.project_completions (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  role         text not null,
  coins_earned int  not null default 0,
  score        int,                    -- 1–5, set by the poster on delivery
  completed    boolean not null default false,
  title        text not null,          -- denormalized for fast profile reads
  cat          text,
  created_at   timestamptz not null default now(),
  constraint project_completions_unique unique (project_id, profile_id),
  constraint project_completions_score_range check (score is null or score between 1 and 5)
);
create index if not exists project_completions_profile_idx
  on public.project_completions (profile_id, created_at desc);

alter table public.project_completions enable row level security;

-- The track record IS the portfolio — public read, writes only via RPCs.
drop policy if exists "completions public read" on public.project_completions;
create policy "completions public read" on public.project_completions
  for select to anon, authenticated using (true);

-- ── release_milestone v3: also builds the track record ───────────────────
create or replace function public.release_milestone(p_milestone_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_ms    public.project_milestones%rowtype;
  v_p     public.projects%rowtype;
  v_total int := 0;
  v_paid  int := 0;
  v_cut   int;
  v_done  boolean;
  r       record;
begin
  if v_uid is null then raise exception 'release_milestone: not authenticated'; end if;

  select * into v_ms from public.project_milestones where id = p_milestone_id for update;
  if not found then raise exception 'release_milestone: milestone not found'; end if;
  if v_ms.released then raise exception 'release_milestone: already released'; end if;

  select * into v_p from public.projects where id = v_ms.project_id;
  if v_p.owner_id is distinct from v_uid and not public.is_admin() then
    raise exception 'release_milestone: only the project owner (or an admin) can release';
  end if;

  update public.project_milestones set released = true where id = p_milestone_id;

  select coalesce(sum(share_pct), 0) into v_total
    from public.project_roles
   where project_id = v_ms.project_id and status = 'filled' and filled_by is not null;

  if v_total > 0 and v_ms.amount > 0 then
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
        -- Track record: accumulate this member's earnings on the project.
        insert into public.project_completions (project_id, profile_id, role, coins_earned, title, cat)
        values (v_ms.project_id, r.filled_by, r.role, v_cut, v_p.title, v_p.cat)
        on conflict (project_id, profile_id) do update
          set coins_earned = public.project_completions.coins_earned + excluded.coins_earned,
              role = excluded.role;
        v_paid := v_paid + v_cut;
      end if;
    end loop;
  end if;

  -- Last milestone out → project delivered, completions stamped complete.
  select not exists (select 1 from public.project_milestones pm
                      where pm.project_id = v_ms.project_id and pm.released = false)
    into v_done;
  if v_done then
    update public.projects set stage = 4 where id = v_ms.project_id;
    update public.project_completions set completed = true where project_id = v_ms.project_id;
  end if;

  return json_build_object('released', v_ms.amount, 'paid_out', v_paid, 'delivered', v_done);
end;
$$;

revoke execute on function public.release_milestone(uuid) from public, anon;
grant  execute on function public.release_milestone(uuid) to authenticated;

-- ── Poster scores the crew on delivery (one score, whole crew) ───────────
create or replace function public.rate_project(p_project_id uuid, p_score int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_owner uuid;
begin
  if v_uid is null then raise exception 'rate_project: not authenticated'; end if;
  if p_score < 1 or p_score > 5 then raise exception 'rate_project: score must be 1-5'; end if;
  select owner_id into v_owner from public.projects where id = p_project_id;
  if not found then raise exception 'rate_project: project not found'; end if;
  if v_owner is distinct from v_uid and not public.is_admin() then
    raise exception 'rate_project: only the project owner (or an admin) can score';
  end if;
  update public.project_completions set score = p_score where project_id = p_project_id;
end;
$$;

revoke execute on function public.rate_project(uuid, int) from public, anon;
grant  execute on function public.rate_project(uuid, int) to authenticated;
