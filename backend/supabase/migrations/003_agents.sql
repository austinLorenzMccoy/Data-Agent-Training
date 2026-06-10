-- One row per authenticated user
create table public.agents (
  id               uuid primary key references auth.users(id) on delete cascade,
  alias            text not null,
  avatar_seed      text,
  total_xp         integer not null default 0,
  rank_tier_id     smallint not null default 1 references public.rank_tiers(id),
  operations_count integer not null default 0,
  best_iq_score    integer not null default 0,
  avg_iq_score     numeric(5,2) not null default 0,
  best_streak      integer not null default 0,
  leaderboard_opt_in boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_agents_total_xp on public.agents(total_xp desc);
create index idx_agents_rank on public.agents(rank_tier_id);
