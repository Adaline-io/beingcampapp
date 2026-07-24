-- =============================================================================
-- BeingCamp — 0017_profile_category.sql
-- The member's chosen agile category (design / tech / film / media / music /
-- events / marketing). It's the professional lane picked at onboarding and
-- drives role-wise access — the work, crew seats, and challenges surfaced to
-- them follow it. Public-read like the rest of the profile.
-- =============================================================================

alter table public.profiles add column if not exists category text;
comment on column public.profiles.category is 'Primary agile discipline chosen at onboarding (industry id).';
