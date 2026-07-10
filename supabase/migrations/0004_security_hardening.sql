-- =============================================================================
-- BeingCamp — 0004_security_hardening.sql
-- Fixes the security advisor warnings:
--  * pin search_path on set_updated_at (mutable search_path lint)
--  * make trigger-only functions non-callable through the public REST API
--    (they still run fine as triggers, which execute as the table owner)
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
