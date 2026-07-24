-- =============================================================================
-- BeingCamp — 0018_profile_privileges.sql
-- Close the self-elevation hole: the "owner update" RLS policy let a member
-- PATCH their own profile row via REST — including is_admin, is_staff,
-- rank_index and balance. That bypassed every wallet cap and admin gate.
--
-- Fix with column-level privileges: members may write only descriptive fields.
-- Wallet + privilege columns change ONLY through SECURITY DEFINER RPCs, which
-- run as the table owner and so bypass these grants:
--   * record_transaction  → now SECURITY DEFINER (still auth.uid()-scoped)
--   * admin_set_staff / admin_set_role → new, is_admin()-gated
-- =============================================================================

-- ── record_transaction: SECURITY DEFINER so it can still move balances ───
create or replace function public.record_transaction(
  p_label  text,
  p_amount int,
  p_ref    text
)
returns json
language plpgsql
security definer
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
  c_per_txn   constant int := 20000;
  c_daily     constant int := 60000;
begin
  if v_uid is null then raise exception 'record_transaction: not authenticated'; end if;
  if v_ref not in ('ritual','zone','pool','store','pack','service','gift','admin') then
    v_ref := 'admin';
  end if;
  if p_amount > c_per_txn then
    raise exception 'record_transaction: single credit over cap (% > %)', p_amount, c_per_txn;
  end if;

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

revoke execute on function public.record_transaction(text, int, text) from public, anon;
grant  execute on function public.record_transaction(text, int, text) to authenticated;

-- ── Admin promotion moves to RPCs (direct column writes are now blocked) ─
create or replace function public.admin_set_staff(p_profile uuid, p_is_staff boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin_set_staff: not an admin'; end if;
  update public.profiles set is_staff = p_is_staff where id = p_profile;
end;
$$;
revoke execute on function public.admin_set_staff(uuid, boolean) from public, anon;
grant  execute on function public.admin_set_staff(uuid, boolean) to authenticated;

create or replace function public.admin_set_role(p_profile uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin_set_role: not an admin'; end if;
  update public.profiles set team_role = nullif(btrim(coalesce(p_role, '')), '') where id = p_profile;
end;
$$;
revoke execute on function public.admin_set_role(uuid, text) from public, anon;
grant  execute on function public.admin_set_role(uuid, text) to authenticated;

-- ── Lock the columns: members write descriptive fields only ──────────────
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, name, accent, city, headline, bio, skills, path, category, avatar_url)
  on public.profiles to authenticated;
grant update (name, accent, city, headline, bio, skills, path, category, avatar_url, updated_at)
  on public.profiles to authenticated;
