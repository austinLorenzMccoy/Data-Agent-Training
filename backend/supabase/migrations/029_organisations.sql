-- Hiring use: organisations run their own exams, invite candidates by link,
-- read results, review AI-graded reasons, and receive results by webhook.
-- Also: questions editable without a deploy, and server-side XP corrections
-- when a reviewer changes a grade.
--
-- Every write goes through server routes with the service role, after the
-- route has checked membership. Members get read access through RLS so
-- dashboards can also be read directly.

-- ── Organisations ───────────────────────────────────────────────────────────

create table if not exists public.organisations (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null check (length(name) between 2 and 120),
  created_by       uuid references auth.users(id) on delete set null,
  webhook_url      text,
  webhook_secret   text,
  -- sha256 hex of the results API key; the key itself is shown once
  api_key_hash     text,
  api_key_prefix   text,
  created_at       timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id     uuid not null references public.organisations(id) on delete cascade,
  agent_id   uuid not null references public.agents(id) on delete cascade,
  role       text not null default 'admin' check (role in ('owner', 'admin', 'reviewer')),
  added_at   timestamptz not null default now(),
  primary key (org_id, agent_id)
);

create index if not exists idx_org_members_agent on public.org_members(agent_id);

create table if not exists public.org_exams (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references public.organisations(id) on delete cascade,
  title           text not null check (length(title) between 2 and 120),
  track           text not null,
  question_count  integer not null default 12 check (question_count between 1 and 60),
  minutes         integer not null default 30 check (minutes between 5 and 240),
  max_attempts    integer not null default 1 check (max_attempts between 1 and 10),
  -- Whether candidates see per-question explanations after finishing.
  show_review     boolean not null default false,
  invite_token    text not null unique,
  opens_at        timestamptz,
  closes_at       timestamptz,
  archived        boolean not null default false,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_org_exams_org on public.org_exams(org_id, created_at desc);

create table if not exists public.org_exam_candidates (
  org_exam_id  uuid not null references public.org_exams(id) on delete cascade,
  agent_id     uuid not null references public.agents(id) on delete cascade,
  email        text,
  name         text,
  joined_at    timestamptz not null default now(),
  primary key (org_exam_id, agent_id)
);

alter table public.operation_attempts
  drop constraint if exists operation_attempts_org_exam_id_fkey;
alter table public.operation_attempts
  add constraint operation_attempts_org_exam_id_fkey
  foreign key (org_exam_id) references public.org_exams(id) on delete set null;

create index if not exists idx_attempts_org_exam on public.operation_attempts(org_exam_id) where org_exam_id is not null;

-- ── Webhook deliveries ──────────────────────────────────────────────────────

create table if not exists public.webhook_deliveries (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references public.organisations(id) on delete cascade,
  event           text not null,
  attempt_id      uuid references public.operation_attempts(id) on delete set null,
  url             text not null,
  payload         jsonb not null,
  status          text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  tries           integer not null default 0,
  next_try_at     timestamptz not null default now(),
  last_status     integer,
  last_error      text,
  delivered_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_webhooks_due on public.webhook_deliveries(next_try_at) where status = 'pending';
create index if not exists idx_webhooks_org on public.webhook_deliveries(org_id, created_at desc);

-- ── Membership helper and read policies ─────────────────────────────────────

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.org_members where org_id = p_org and agent_id = auth.uid());
$$;

alter table public.organisations       enable row level security;
alter table public.org_members         enable row level security;
alter table public.org_exams           enable row level security;
alter table public.org_exam_candidates enable row level security;
alter table public.webhook_deliveries  enable row level security;

drop policy if exists "Members read their organisation" on public.organisations;
create policy "Members read their organisation"
  on public.organisations for select using (public.is_org_member(id));

drop policy if exists "Members read membership" on public.org_members;
create policy "Members read membership"
  on public.org_members for select using (public.is_org_member(org_id));

drop policy if exists "Members read exams" on public.org_exams;
create policy "Members read exams"
  on public.org_exams for select using (public.is_org_member(org_id));

drop policy if exists "Members read candidates" on public.org_exam_candidates;
create policy "Members read candidates"
  on public.org_exam_candidates for select
  using (exists (select 1 from public.org_exams e where e.id = org_exam_id and public.is_org_member(e.org_id)));

drop policy if exists "Members read deliveries" on public.webhook_deliveries;
create policy "Members read deliveries"
  on public.webhook_deliveries for select using (public.is_org_member(org_id));

-- organisations.webhook_secret and api_key_hash must not be readable by
-- members' browsers; only the service role reads them.
revoke select on public.organisations from authenticated, anon;
grant select (id, name, created_by, webhook_url, api_key_prefix, created_at) on public.organisations to authenticated;

-- ── Editable questions ──────────────────────────────────────────────────────

-- Questions added or changed in the content admin. A row with the same id
-- as a built-in question replaces it; status 'retired' removes it from the
-- bank. `data` holds the full Question, answer key included, so the table
-- has no client policies at all.
create table if not exists public.bank_questions (
  id          text primary key,
  type        text not null,
  data        jsonb not null,
  status      text not null default 'draft' check (status in ('draft', 'live', 'retired')),
  updated_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

alter table public.bank_questions enable row level security;

-- ── XP correction ───────────────────────────────────────────────────────────

-- Applies an XP change after a reviewer changes a grade, keeping rank in
-- step. Service role only.
create or replace function public.adjust_agent_xp(p_agent_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.agents
  set total_xp     = greatest(0, total_xp + p_delta),
      rank_tier_id = public.calculate_rank_tier(greatest(0, total_xp + p_delta)),
      updated_at   = now()
  where id = p_agent_id;
end;
$$;

revoke all on function public.adjust_agent_xp(uuid, integer) from public, anon, authenticated;
grant execute on function public.adjust_agent_xp(uuid, integer) to service_role;
