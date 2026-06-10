-- Enable RLS
alter table public.agents           enable row level security;
alter table public.operations       enable row level security;
alter table public.agent_badges     enable row level security;
alter table public.rank_tiers       enable row level security;
alter table public.badge_definitions enable row level security;

-- rank_tiers: readable by all authenticated users
create policy "Anyone can read rank tiers"
  on public.rank_tiers for select using (true);

-- badge_definitions: readable by all authenticated users
create policy "Anyone can read badge definitions"
  on public.badge_definitions for select using (true);

-- agents: own row only
create policy "Agents can read own profile"
  on public.agents for select using (auth.uid() = id);

create policy "Agents can insert own profile"
  on public.agents for insert with check (auth.uid() = id);

create policy "Agents can update own profile"
  on public.agents for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- operations: own rows only (immutable once inserted)
create policy "Agents can read own operations"
  on public.operations for select using (auth.uid() = agent_id);

create policy "Agents can insert own operations"
  on public.operations for insert with check (auth.uid() = agent_id);

-- agent_badges: own rows only (immutable)
create policy "Agents can read own badges"
  on public.agent_badges for select using (auth.uid() = agent_id);

create policy "Agents can insert own badges"
  on public.agent_badges for insert with check (auth.uid() = agent_id);
