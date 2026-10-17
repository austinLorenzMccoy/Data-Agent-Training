-- Soft-lockdown flags from the test client (tab switches, fullscreen exits,
-- blocked pastes). A summary of a few hundred bytes per attempt, so there
-- is nothing to prune on a schedule. Null for attempts made before this shipped.

alter table public.operations
  add column if not exists integrity jsonb;

create index if not exists idx_operations_unverified
  on public.operations ((integrity->>'verified'))
  where integrity->>'verified' = 'false';
