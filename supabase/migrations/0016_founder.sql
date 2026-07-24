-- =============================================================================
-- BeingCamp — 0016_founder.sql
-- Bootstrap the super admin without any manual step. When the founder signs in
-- for the first time with the team/admin login, the profile that gets created
-- is auto-crowned Super Admin — matched by the exact auth email, so no one else
-- can claim it. Changing the email later is a one-line edit + re-run.
-- =============================================================================

create or replace function public.crown_founder()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
begin
  select lower(email) into v_email from auth.users where id = new.id;
  if v_email = 'adaline.digi@gmail.com' then
    new.is_admin := true;
    new.is_staff := true;
    if new.team_role is null then new.team_role := 'Super Admin'; end if;
    -- One founder — give the account its name on creation (editable later).
    if tg_op = 'INSERT' then new.name := 'Jareer'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_crown_founder on public.profiles;
create trigger trg_crown_founder
  before insert or update on public.profiles
  for each row execute function public.crown_founder();

-- Crown immediately if the founder's account already exists.
update public.profiles p
   set is_admin = true, is_staff = true,
       team_role = coalesce(team_role, 'Super Admin')
  from auth.users u
 where u.id = p.id and lower(u.email) = 'adaline.digi@gmail.com';
