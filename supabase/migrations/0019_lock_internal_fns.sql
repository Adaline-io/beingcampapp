-- =============================================================================
-- BeingCamp — 0019_lock_internal_fns.sql
-- Advisor cleanup: the notification helper + trigger functions are SECURITY
-- DEFINER and were reachable over the REST API (/rpc/notify etc). notify() in
-- particular could be called by any signed-in user to spam another member's
-- feed. They only ever run inside triggers (as the table owner), so revoking
-- EXECUTE from anon/authenticated closes the surface without breaking anything —
-- triggers fire regardless of caller EXECUTE grants.
-- =============================================================================

revoke execute on function public.notify(uuid, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.crown_founder() from public, anon, authenticated;
revoke execute on function public.trg_notify_member_join() from public, anon, authenticated;
revoke execute on function public.trg_notify_earn() from public, anon, authenticated;
revoke execute on function public.trg_notify_comment() from public, anon, authenticated;
revoke execute on function public.trg_notify_score() from public, anon, authenticated;
revoke execute on function public.stamp_task_status_change() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
