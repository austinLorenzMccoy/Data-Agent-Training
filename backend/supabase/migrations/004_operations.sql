-- One row per completed Live Operation (test session)
create table public.operations (
  id                  uuid primary key default uuid_generate_v4(),
  agent_id            uuid not null references public.agents(id) on delete cascade,
  operation_name      text not null,
  iq_score            integer not null,
  xp_earned           integer not null,
  questions_total     integer not null,
  questions_correct   integer not null,
  time_taken_seconds  integer,
  passed              boolean not null,
  category_scores     jsonb not null default '{}',
  answers             jsonb not null default '[]',
  rank_before         smallint references public.rank_tiers(id),
  rank_after          smallint references public.rank_tiers(id),
  created_at          timestamptz not null default now()
);

create index idx_operations_agent_id on public.operations(agent_id, created_at desc);
create index idx_operations_iq_score on public.operations(iq_score desc);
