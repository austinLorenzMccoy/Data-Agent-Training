alter table public.billing_plans  enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.usage_counters enable row level security;

drop policy if exists "Anyone can read billing plans" on public.billing_plans;
create policy "Anyone can read billing plans"
  on public.billing_plans for select
  using (true);

-- subscriptions is select-only for authenticated agents. Deliberately no
-- insert/update/delete policy — a client must never be able to grant
-- itself a paid plan by writing this table directly. All mutations go
-- through the service-role client from the webhook / subscriptions API
-- routes, which bypasses RLS entirely.
drop policy if exists "Agents can read own subscription" on public.subscriptions;
create policy "Agents can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = agent_id);

-- usage_counters is select-only for the same reason; the only write path
-- is the increment_usage_counter() SECURITY DEFINER RPC (024), which
-- self-scopes to auth.uid() inside the function body.
drop policy if exists "Agents can read own usage counters" on public.usage_counters;
create policy "Agents can read own usage counters"
  on public.usage_counters for select
  using (auth.uid() = agent_id);
