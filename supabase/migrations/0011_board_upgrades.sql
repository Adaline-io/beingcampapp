-- =============================================================================
-- BeingCamp — 0011_board_upgrades.sql
-- Agile board, round two:
--   * tasks.due_date            — deadlines on cards (overdue turns red)
--   * tasks.status_changed_at   — stamped by trigger whenever a card moves
--                                 column, so "3d in Doing" is real data
--   * task_comments             — threaded discussion on any card
-- =============================================================================

alter table public.tasks add column if not exists due_date date;
alter table public.tasks add column if not exists status_changed_at timestamptz not null default now();

-- Stamp the column-entry time only when the status actually changes.
create or replace function public.stamp_task_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tasks_status_changed on public.tasks;
create trigger trg_tasks_status_changed
  before update on public.tasks
  for each row execute function public.stamp_task_status_change();

-- ── Comments on cards ────────────────────────────────────────────────────
create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid        not null references public.tasks (id) on delete cascade,
  author_id  uuid        references public.profiles (id) on delete set null,
  body       text        not null,
  created_at timestamptz not null default now(),
  constraint task_comments_body_len check (char_length(body) between 1 and 2000)
);
create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);

alter table public.task_comments enable row level security;

-- Staff see and write everything; assignees can discuss their own cards.
drop policy if exists "comments staff all" on public.task_comments;
create policy "comments staff all" on public.task_comments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "comments assignee read" on public.task_comments;
create policy "comments assignee read" on public.task_comments for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = auth.uid()));

drop policy if exists "comments assignee write" on public.task_comments;
create policy "comments assignee write" on public.task_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = auth.uid())
  );
