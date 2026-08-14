-- Specialisation tracks (v3 §7 / v4 §7). Additive.
-- New domains accrue track-isolated XP rather than the core rank ladder.

create table if not exists public.tracks (
  id          text primary key,
  label       text not null,
  focus_type  text not null,
  xp_required integer not null default 0
);

create table if not exists public.agent_tracks (
  agent_id  uuid not null references public.agents(id) on delete cascade,
  track_id  text not null references public.tracks(id) on delete cascade,
  xp        integer not null default 0,
  primary key (agent_id, track_id)
);

insert into public.tracks (id, label, focus_type, xp_required) values
  ('map_evaluator', 'Map Evaluation Specialist', 'epsilon', 3000),
  ('search_quality_rater', 'Search Quality Rater', 'zeta', 5000),
  ('search_quality_rater_lite', 'Search Quality Associate', 'eta', 2000),
  ('transcription_specialist', 'Transcription Specialist', 'theta', 4000)
on conflict (id) do nothing;

alter table public.tracks enable row level security;
alter table public.agent_tracks enable row level security;

drop policy if exists "Anyone can read tracks" on public.tracks;
create policy "Anyone can read tracks"
  on public.tracks for select
  using (true);

drop policy if exists "Agents can read own track xp" on public.agent_tracks;
create policy "Agents can read own track xp"
  on public.agent_tracks for select
  using (auth.uid() = agent_id);

drop policy if exists "Agents can upsert own track xp" on public.agent_tracks;
create policy "Agents can upsert own track xp"
  on public.agent_tracks for insert
  with check (auth.uid() = agent_id);

drop policy if exists "Agents can update own track xp" on public.agent_tracks;
create policy "Agents can update own track xp"
  on public.agent_tracks for update
  using (auth.uid() = agent_id)
  with check (auth.uid() = agent_id);
