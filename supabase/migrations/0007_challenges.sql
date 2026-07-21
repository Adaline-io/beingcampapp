-- =============================================================================
-- BeingCamp — 0007_challenges.sql
-- Community challenges become real: table + entries + admin-awarded payouts.
-- =============================================================================

create table if not exists public.challenges (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null,
  industry      text        not null default 'design',
  reward        int         not null default 0,
  deadline_text text        not null default 'Open',
  tag           text        not null default 'Open',
  description   text,
  status        text        not null default 'open',
  created_at    timestamptz not null default now(),
  constraint challenges_status_check check (status in ('open', 'closed'))
);

create table if not exists public.challenge_entries (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid        not null references public.challenges (id) on delete cascade,
  profile_id   uuid        not null references public.profiles (id) on delete cascade,
  winner       boolean     not null default false,
  created_at   timestamptz not null default now(),
  unique (challenge_id, profile_id)
);

alter table public.challenges       enable row level security;
alter table public.challenge_entries enable row level security;

drop policy if exists "challenges public read" on public.challenges;
create policy "challenges public read" on public.challenges for select to anon, authenticated using (true);

drop policy if exists "challenges admin write" on public.challenges;
create policy "challenges admin write" on public.challenges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "entries public read" on public.challenge_entries;
create policy "entries public read" on public.challenge_entries for select to anon, authenticated using (true);

drop policy if exists "entries owner insert" on public.challenge_entries;
create policy "entries owner insert" on public.challenge_entries for insert to authenticated
  with check (auth.uid() = profile_id);

-- Award the pot: admin-only; pays the winner, marks the entry, closes the challenge.
create or replace function public.award_challenge(p_challenge uuid, p_profile uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ch public.challenges%rowtype;
begin
  if not public.is_admin() then raise exception 'award_challenge: not an admin'; end if;

  select * into v_ch from public.challenges where id = p_challenge for update;
  if not found then raise exception 'award_challenge: challenge not found'; end if;
  if v_ch.status = 'closed' then raise exception 'award_challenge: already closed'; end if;

  update public.profiles
     set balance = balance + v_ch.reward,
         activity_coins = activity_coins + v_ch.reward
   where id = p_profile;
  if not found then raise exception 'award_challenge: profile not found'; end if;

  insert into public.transactions (profile_id, label, amount, ref)
  values (p_profile, 'Challenge won · ' || v_ch.title, v_ch.reward, 'ritual');

  insert into public.challenge_entries (challenge_id, profile_id, winner)
  values (p_challenge, p_profile, true)
  on conflict (challenge_id, profile_id) do update set winner = true;

  update public.challenges set status = 'closed' where id = p_challenge;
  return json_build_object('paid', v_ch.reward);
end;
$$;

revoke execute on function public.award_challenge(uuid, uuid) from public, anon;
grant  execute on function public.award_challenge(uuid, uuid) to authenticated;

-- Seed the launch set (idempotent-ish: only when empty).
insert into public.challenges (title, industry, reward, deadline_text, tag, description)
select * from (values
  ('Poster Jam: Monsoon Edition', 'design', 300, '6 days',  'Weekly', 'One poster, any medium, on this month''s theme: monsoon in the city. Top 3 picked at Friday Crit Night.'),
  ('60-Second Story',             'film',   500, '12 days', 'Open',   'Tell a complete story in sixty seconds. Phone footage welcome. Screened at The Stage.'),
  ('Camp Website Micro-tool',     'tech',   400, '9 days',  'Build',  'Build a tiny tool the Camp actually needs. Ships if it wins.'),
  ('Street Portrait Series',      'media',  250, '4 days',  'Weekly', 'Five portraits, one street, one hour of light. Series thinking over single shots.'),
  ('Sound of the Space',          'music',  350, '15 days', 'Open',   'A 90-second ambient piece built from sounds recorded inside BeingCamp.')
) as v(title, industry, reward, deadline_text, tag, description)
where not exists (select 1 from public.challenges);
