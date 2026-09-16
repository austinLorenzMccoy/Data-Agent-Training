-- Extend the existing new-user provisioning to also open a free
-- subscription row, so every agent has exactly one subscriptions row from
-- first sign-in and the rest of the app never needs a nullable-subscription
-- branch.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.agents (id, alias, avatar_seed)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    upper(left(coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ), 2))
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (agent_id, plan_id, status, current_period_start)
  values (new.id, 1, 'active', now())
  on conflict (agent_id) do nothing;

  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

-- Only write path into usage_counters. security definer + the auth.uid()
-- check keeps this the sole gate: a caller can increment/read only their
-- own row, table-level RLS grants no direct access at all.
create or replace function public.increment_usage_counter(
  p_agent_id    uuid,
  p_counter_key text,
  p_period_type text,
  p_period_key  text,
  p_increment   integer default 1
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is distinct from p_agent_id then
    raise exception 'not authorized';
  end if;

  insert into public.usage_counters (agent_id, counter_key, period_type, period_key, count)
  values (p_agent_id, p_counter_key, p_period_type, p_period_key, p_increment)
  on conflict (agent_id, counter_key, period_type, period_key)
  do update set count = usage_counters.count + excluded.count, updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

grant execute on function public.increment_usage_counter(uuid, text, text, text, integer) to authenticated;
