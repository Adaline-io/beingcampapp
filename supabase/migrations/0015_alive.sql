-- =============================================================================
-- BeingCamp — 0015_alive.sql
-- Make the system react in real time:
--   * notify() helper + triggers → the bell fills on claim, payout, comment,
--     and score (no more "learn it only on reload")
--   * rate_member — score one crew member, not the whole crew at once
--   * realtime publication → notifications / tasks / project_members stream
--     to subscribed clients (board + bell update live)
-- Triggers sit on the underlying tables, so the existing RPCs keep working
-- unchanged and every path that touches them fires a notification.
-- =============================================================================

-- ── Small helper: drop a notification into a member's feed ───────────────
create or replace function public.notify(
  p_profile uuid, p_ic text, p_tone text, p_title text, p_body text, p_cta text
) returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.notifications (profile_id, ic, tone, title, body, cta)
  values (p_profile, p_ic, p_tone, p_title, p_body, p_cta);
$$;

-- ── A member claims a seat → tell the poster ─────────────────────────────
create or replace function public.trg_notify_member_join()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_owner uuid; v_title text; v_name text;
begin
  if new.role = 'poster' then return new; end if;
  select owner_id, title into v_owner, v_title from public.projects where id = new.project_id;
  select coalesce(name, 'A member') into v_name from public.profiles where id = new.profile_id;
  if v_owner is not null and v_owner <> new.profile_id then
    perform public.notify(v_owner, 'user', 'blue', new.role || ' joined',
      v_name || ' claimed the ' || new.role || ' seat on ' || coalesce(v_title, 'your project'), 'projects');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_member_join on public.project_members;
create trigger trg_member_join after insert on public.project_members
  for each row execute function public.trg_notify_member_join();

-- ── A milestone pays out → tell each earner ──────────────────────────────
create or replace function public.trg_notify_earn()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.amount > 0 and new.label like 'Milestone released%' then
    perform public.notify(new.profile_id, 'wallet', 'gold',
      'You earned ' || new.amount || ' BC', new.label, 'wallet');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_earn on public.transactions;
create trigger trg_earn after insert on public.transactions
  for each row execute function public.trg_notify_earn();

-- ── A comment lands on a card → tell its assignee ────────────────────────
create or replace function public.trg_notify_comment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_assignee uuid; v_title text;
begin
  select assignee_id, title into v_assignee, v_title from public.tasks where id = new.task_id;
  if v_assignee is not null and v_assignee <> new.author_id then
    perform public.notify(v_assignee, 'bell', 'purple', 'New comment',
      'On “' || coalesce(v_title, 'a task') || '”', 'board');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_comment on public.task_comments;
create trigger trg_comment after insert on public.task_comments
  for each row execute function public.trg_notify_comment();

-- ── A crew member gets scored → tell them ────────────────────────────────
create or replace function public.trg_notify_score()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.score is not null and new.score is distinct from old.score then
    perform public.notify(new.profile_id, 'star', 'gold', 'Your work was scored',
      new.title || ' · ' || new.score || '/5', 'projects');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_score on public.project_completions;
create trigger trg_score after update of score on public.project_completions
  for each row execute function public.trg_notify_score();

-- ── rate_member: score one crew member (per-person, not the whole crew) ──
create or replace function public.rate_member(p_project_id uuid, p_profile uuid, p_score int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_owner uuid;
begin
  if auth.uid() is null then raise exception 'rate_member: not authenticated'; end if;
  if p_score < 1 or p_score > 5 then raise exception 'rate_member: score must be 1-5'; end if;
  select owner_id into v_owner from public.projects where id = p_project_id;
  if not found then raise exception 'rate_member: project not found'; end if;
  if v_owner is distinct from auth.uid() and not public.is_admin() then
    raise exception 'rate_member: only the project owner (or an admin) can score';
  end if;
  update public.project_completions set score = p_score
    where project_id = p_project_id and profile_id = p_profile;
end;
$$;

revoke execute on function public.rate_member(uuid, uuid, int) from public, anon;
grant  execute on function public.rate_member(uuid, uuid, int) to authenticated;

-- ── Realtime: stream these tables to subscribed clients ──────────────────
do $$ begin alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.project_members;
exception when duplicate_object then null; end $$;
