-- =============================================================================
-- BeingCamp — 0006_admin.sql
-- Founder/admin tooling:
--   * profiles.is_admin flag + is_admin() helper
--   * admins can write the catalog (products, packs, services, briefs,
--     workshops, zones) straight from the app
--   * admin_grant / admin_set_rank RPCs for member management
--
-- After applying, make yourself admin (SQL editor):
--   update public.profiles set is_admin = true where name = 'YOUR NAME';
-- =============================================================================

alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- Catalog write access for admins (read stays public).
do $$
declare t text;
begin
  foreach t in array array['products','coin_packs','services','pool_briefs','workshops','zones'] loop
    execute format('drop policy if exists "%s admin write" on public.%I', t, t);
    execute format(
      'create policy "%s admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t, t
    );
  end loop;
end $$;

-- Grant (or deduct) coins for any member, with a ledger row.
create or replace function public.admin_grant(p_profile uuid, p_amount int, p_label text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
begin
  if not public.is_admin() then raise exception 'admin_grant: not an admin'; end if;

  update public.profiles
     set balance = balance + p_amount,
         activity_coins = activity_coins + greatest(p_amount, 0)
   where id = p_profile
  returning balance into v_balance;
  if not found then raise exception 'admin_grant: profile not found'; end if;

  insert into public.transactions (profile_id, label, amount, ref)
  values (p_profile, coalesce(p_label, 'Camp grant'), p_amount, 'admin');

  return json_build_object('balance', v_balance);
end;
$$;

revoke execute on function public.admin_grant(uuid, int, text) from public, anon;
grant  execute on function public.admin_grant(uuid, int, text) to authenticated;

-- Set a member's rank (0 Visitor .. 4 Chief).
create or replace function public.admin_set_rank(p_profile uuid, p_rank int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin_set_rank: not an admin'; end if;
  if p_rank not between 0 and 4 then raise exception 'admin_set_rank: rank out of range'; end if;
  update public.profiles set rank_index = p_rank where id = p_profile;
  if not found then raise exception 'admin_set_rank: profile not found'; end if;
end;
$$;

revoke execute on function public.admin_set_rank(uuid, int) from public, anon;
grant  execute on function public.admin_set_rank(uuid, int) to authenticated;
