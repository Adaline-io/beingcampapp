-- =============================================================================
-- BeingCamp — 0009_agile_team.sql
-- Internal agency operating system:
--   * profiles.team_role — the member's function in the agency (shown on
--     profiles; null = community member, not internal team)
--   * tasks — the agile board (backlog → todo → doing → review → done),
--     sprint-tagged, pointed, assignable
--   * Jareer seeded as super admin (admin + staff + role)
-- =============================================================================

alter table public.profiles add column if not exists team_role text;

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  detail      text,
  status      text        not null default 'backlog',
  sprint      text        not null default 'S1',
  points      int         not null default 1,
  priority    int         not null default 2,          -- 1 high · 2 normal · 3 low
  project_id  uuid        references public.projects (id) on delete set null,
  assignee_id uuid        references public.profiles (id) on delete set null,
  created_by  uuid        references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint tasks_status_check check (status in ('backlog','todo','doing','review','done')),
  constraint tasks_points_range check (points between 1 and 13)
);

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index if not exists tasks_sprint_status_idx on public.tasks (sprint, status);
create index if not exists tasks_assignee_idx on public.tasks (assignee_id);

alter table public.tasks enable row level security;

-- Staff/admin run the board; assignees may read + move their own cards.
drop policy if exists "tasks staff all" on public.tasks;
create policy "tasks staff all" on public.tasks for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "tasks assignee read" on public.tasks;
create policy "tasks assignee read" on public.tasks for select to authenticated
  using (auth.uid() = assignee_id);

drop policy if exists "tasks assignee move" on public.tasks;
create policy "tasks assignee move" on public.tasks for update to authenticated
  using (auth.uid() = assignee_id) with check (auth.uid() = assignee_id);

-- Crown the super admin (matches by name; adjust if the profile name differs).
update public.profiles
   set is_admin = true, is_staff = true, team_role = 'Super Admin'
 where lower(name) like 'jareer%';
