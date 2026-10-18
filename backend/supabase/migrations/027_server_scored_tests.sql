-- Server-scored tests.
--
-- Before this, the browser held the answer key, scored itself, and inserted
-- its own `operations` row (and could insert badges or edit total_xp). Now a
-- test is an `operation_attempts` row owned by the server: the start route
-- draws and shuffles the questions, the answer route grades each one, and the
-- finish route writes `operations` with the service-role key. Clients keep
-- read access to their own rows and nothing else.

-- ── Attempts ────────────────────────────────────────────────────────────────

create table if not exists public.operation_attempts (
  id             uuid primary key default uuid_generate_v4(),
  agent_id       uuid not null references public.agents(id) on delete cascade,
  track          text not null,
  operation_name text not null,
  -- [{ id, perm }] in the order shown; perm maps shown option → original index
  questions      jsonb not null,
  -- { [questionIndex]: Answer } in canonical (unshuffled) form
  answers        jsonb not null default '{}',
  status         text not null default 'active' check (status in ('active', 'finished')),
  started_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  finished_at    timestamptz,
  operation_id   uuid references public.operations(id) on delete set null,
  org_exam_id    uuid
);

create index if not exists idx_attempts_agent_started
  on public.operation_attempts(agent_id, started_at desc);
create unique index if not exists idx_attempts_one_active
  on public.operation_attempts(agent_id) where status = 'active';

alter table public.operation_attempts enable row level security;

-- Read-only for the owner, and only once finished: an active attempt's
-- question ids and permutations stay server-side.
drop policy if exists "Agents can read own finished attempts" on public.operation_attempts;
create policy "Agents can read own finished attempts"
  on public.operation_attempts for select
  using (auth.uid() = agent_id and status = 'finished');

alter table public.operations
  add column if not exists attempt_id uuid references public.operation_attempts(id) on delete set null;

-- ── Lock down client writes ─────────────────────────────────────────────────

drop policy if exists "Agents can insert own operations" on public.operations;
drop policy if exists "Agents can insert own badges" on public.agent_badges;

-- Agents may still rename themselves and toggle the leaderboard, but XP,
-- rank and score columns are written only by triggers and the service role.
revoke update on public.agents from authenticated, anon;
grant update (alias, avatar_seed, leaderboard_opt_in) on public.agents to authenticated;

-- Pre-signup localStorage progress is shown on the profile but never counts
-- toward rank or the leaderboard (it was self-reported).
alter table public.agents
  add column if not exists imported_xp integer not null default 0;

-- ── Grading log ─────────────────────────────────────────────────────────────

-- Every AI or heuristic grade of a written justification, with the model that
-- produced it, so a disputed score can be traced and a reviewer can override.
create table if not exists public.grading_log (
  id                 uuid primary key default uuid_generate_v4(),
  agent_id           uuid references public.agents(id) on delete cascade,
  attempt_id         uuid references public.operation_attempts(id) on delete cascade,
  question_id        text not null,
  question_index     integer,
  justification      text not null,
  score              smallint not null check (score between 0 and 2),
  feedback           text,
  mode               text not null,
  model              text,
  flagged_injection  boolean not null default false,
  override_score     smallint check (override_score between 0 and 2),
  override_by        uuid references auth.users(id),
  override_note      text,
  override_at        timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_grading_log_attempt on public.grading_log(attempt_id);
create index if not exists idx_grading_log_agent on public.grading_log(agent_id, created_at desc);

alter table public.grading_log enable row level security;

drop policy if exists "Agents can read own grades" on public.grading_log;
create policy "Agents can read own grades"
  on public.grading_log for select
  using (auth.uid() = agent_id);

-- ── Proficiency results ─────────────────────────────────────────────────────

-- The language exam used to record a pass in localStorage and a cookie. The
-- server now scores it and keeps the record the test gate reads.
create table if not exists public.proficiency_results (
  agent_id   uuid not null references public.agents(id) on delete cascade,
  exam_id    text not null,
  score      integer not null,
  passed     boolean not null,
  taken_at   timestamptz not null default now(),
  primary key (agent_id, exam_id)
);

alter table public.proficiency_results enable row level security;

drop policy if exists "Agents can read own proficiency" on public.proficiency_results;
create policy "Agents can read own proficiency"
  on public.proficiency_results for select
  using (auth.uid() = agent_id);

-- ── Atomic answer write ─────────────────────────────────────────────────────

-- Adds one answer to an active, unexpired attempt. Returns false if the
-- attempt is finished, past its deadline (plus a short network grace), not
-- the caller's, or that question was already answered — so a slow double
-- submit can't overwrite the first answer. Called only by the service role.
create or replace function public.record_attempt_answer(
  p_attempt_id uuid,
  p_agent_id   uuid,
  p_index      integer,
  p_answer     jsonb,
  p_grace_sec  integer default 20
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.operation_attempts
  set answers = answers || jsonb_build_object(p_index::text, p_answer)
  where id = p_attempt_id
    and agent_id = p_agent_id
    and status = 'active'
    and now() <= expires_at + make_interval(secs => p_grace_sec)
    and p_index >= 0
    and p_index < jsonb_array_length(questions)
    and not (answers ? p_index::text);
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

revoke all on function public.record_attempt_answer(uuid, uuid, integer, jsonb, integer) from public, anon, authenticated;
grant execute on function public.record_attempt_answer(uuid, uuid, integer, jsonb, integer) to service_role;
