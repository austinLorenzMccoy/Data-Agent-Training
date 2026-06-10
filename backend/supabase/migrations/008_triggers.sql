-- Helper: calculate rank tier from XP
create or replace function public.calculate_rank_tier(xp integer)
returns smallint
language sql
stable
as $$
  select id
  from public.rank_tiers
  where xp_required <= xp
  order by xp_required desc
  limit 1;
$$;

-- Trigger: update agent stats after an operation is inserted
create or replace function public.handle_operation_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  v_new_xp      integer;
  v_new_rank    smallint;
  v_old_rank    smallint;
  v_new_avg     numeric(5,2);
  v_ops_count   integer;
  v_best_iq     integer;
  v_best_streak integer;
begin
  select total_xp, rank_tier_id, operations_count, best_iq_score, best_streak
  into   v_new_xp, v_old_rank, v_ops_count, v_best_iq, v_best_streak
  from   public.agents where id = new.agent_id;

  v_new_xp    := v_new_xp + new.xp_earned;
  v_new_rank  := public.calculate_rank_tier(v_new_xp);
  v_ops_count := v_ops_count + 1;
  v_best_iq   := greatest(v_best_iq, new.iq_score);

  select avg(iq_score) into v_new_avg
  from public.operations where agent_id = new.agent_id;

  update public.operations
  set rank_before = v_old_rank, rank_after = v_new_rank
  where id = new.id;

  update public.agents
  set total_xp         = v_new_xp,
      rank_tier_id     = v_new_rank,
      operations_count = v_ops_count,
      best_iq_score    = v_best_iq,
      avg_iq_score     = v_new_avg,
      updated_at       = now()
  where id = new.agent_id;

  return new;
end;
$$;

create trigger on_operation_insert
  after insert on public.operations
  for each row execute function public.handle_operation_insert();

-- Auto-update updated_at on agents
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agents_updated_at
  before update on public.agents
  for each row execute function public.update_updated_at_column();

-- Create agent profile on first sign-in
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Award badges after operation insert
create or replace function public.award_badges_after_operation()
returns trigger
language plpgsql
security definer
as $$
declare
  v_agent     record;
  v_badge_ids text[] := '{}';
begin
  select * into v_agent from public.agents where id = new.agent_id;

  if v_agent.operations_count = 1 then
    v_badge_ids := array_append(v_badge_ids, 'first_operation');
  end if;

  if new.passed then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'first_pass') then
      v_badge_ids := array_append(v_badge_ids, 'first_pass');
    end if;
  end if;

  if new.iq_score = 100 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'perfect_score') then
      v_badge_ids := array_append(v_badge_ids, 'perfect_score');
    end if;
  end if;

  if v_agent.rank_tier_id >= 2 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_operative') then
      v_badge_ids := array_append(v_badge_ids, 'rank_operative'); end if;
  end if;
  if v_agent.rank_tier_id >= 3 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_field_agent') then
      v_badge_ids := array_append(v_badge_ids, 'rank_field_agent'); end if;
  end if;
  if v_agent.rank_tier_id >= 4 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_specialist') then
      v_badge_ids := array_append(v_badge_ids, 'rank_specialist'); end if;
  end if;
  if v_agent.rank_tier_id >= 5 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_analyst') then
      v_badge_ids := array_append(v_badge_ids, 'rank_analyst'); end if;
  end if;
  if v_agent.rank_tier_id >= 6 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_senior_analyst') then
      v_badge_ids := array_append(v_badge_ids, 'rank_senior_analyst'); end if;
  end if;
  if v_agent.rank_tier_id = 7 then
    if not exists (select 1 from public.agent_badges where agent_id = new.agent_id and badge_id = 'rank_director') then
      v_badge_ids := array_append(v_badge_ids, 'rank_director'); end if;
  end if;

  if array_length(v_badge_ids, 1) > 0 then
    insert into public.agent_badges (agent_id, badge_id)
    select new.agent_id, unnest(v_badge_ids)
    on conflict (agent_id, badge_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_operation_award_badges
  after insert on public.operations
  for each row execute function public.award_badges_after_operation();
