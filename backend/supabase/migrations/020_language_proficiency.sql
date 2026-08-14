-- v4 §6. Language proficiency gate.
-- recruiter_orgs is a v3 §8 table. Create a slim version if this install never shipped it.

create table if not exists public.recruiter_orgs (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.proficiency_exams (
  id         text primary key,
  label      text not null,
  pass_score integer not null default 80,
  questions  jsonb not null
);

create table if not exists public.agent_proficiency_results (
  agent_id      uuid not null references public.agents(id) on delete cascade,
  exam_id       text not null references public.proficiency_exams(id),
  score         integer not null,
  passed        boolean not null,
  completed_at  timestamptz not null default now(),
  primary key (agent_id, exam_id)
);

alter table public.recruiter_orgs
  add column if not exists required_proficiency_exam text references public.proficiency_exams(id);

insert into public.proficiency_exams (id, label, pass_score, questions)
values (
  'en-CA',
  'English (Canada) Language Proficiency',
  80,
  '[]'::jsonb
)
on conflict (id) do nothing;

alter table public.proficiency_exams enable row level security;
alter table public.agent_proficiency_results enable row level security;
alter table public.recruiter_orgs enable row level security;

drop policy if exists "Anyone can read proficiency exams" on public.proficiency_exams;
create policy "Anyone can read proficiency exams"
  on public.proficiency_exams for select
  using (true);

drop policy if exists "Agents can read own proficiency results" on public.agent_proficiency_results;
create policy "Agents can read own proficiency results"
  on public.agent_proficiency_results for select
  using (auth.uid() = agent_id);

drop policy if exists "Agents can insert own proficiency results" on public.agent_proficiency_results;
create policy "Agents can insert own proficiency results"
  on public.agent_proficiency_results for insert
  with check (auth.uid() = agent_id);

drop policy if exists "Anyone can read recruiter orgs" on public.recruiter_orgs;
create policy "Anyone can read recruiter orgs"
  on public.recruiter_orgs for select
  using (true);
