-- Paystack recurring billing. Additive — free tier is the default for every agent.
-- billing_plans is a static reference table (same shape as rank_tiers).
-- "Clearance" is a distinct axis from the XP rank ladder so nav copy never
-- reads self-contradictory (e.g. "Rank: Recruit · Clearance: Director").

create table if not exists public.billing_plans (
  id                    smallint primary key,
  slug                  text not null unique,
  label                 text not null,
  price_kobo            integer not null default 0,
  paystack_plan_code    text,
  interval              text not null default 'monthly',
  trial_days            integer not null default 0,
  practice_daily_limit  integer,
  tests_monthly_limit   integer,
  is_paid               boolean not null default false,
  created_at            timestamptz not null default now()
);
-- null practice_daily_limit / tests_monthly_limit means unlimited.

insert into public.billing_plans
  (id, slug, label, price_kobo, paystack_plan_code, interval, trial_days, practice_daily_limit, tests_monthly_limit, is_paid)
values
  (1, 'free',  'Recruit Clearance',  0,      null, 'monthly', 0, 15,   2,   false),
  (2, 'pro',   'Operative Clearance', 500000, null, 'monthly', 7, 150,  20,  true),
  (3, 'elite', 'Director Clearance',  1000000, null, 'monthly', 7, 2000, 100, true)
on conflict (id) do nothing;
-- paystack_plan_code is filled in by hand after creating the matching Plan
-- in the Paystack dashboard (Products -> Plans) — see PAYSTACK_PLAN_CODE_PRO
-- / PAYSTACK_PLAN_CODE_ELITE in .env.example.

create table if not exists public.subscriptions (
  id                        uuid primary key default uuid_generate_v4(),
  agent_id                  uuid not null unique references public.agents(id) on delete cascade,
  plan_id                   smallint not null default 1 references public.billing_plans(id),
  status                    text not null default 'active'
                              check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  paystack_customer_code    text,
  paystack_subscription_code text,
  paystack_email_token      text,
  paystack_authorization_code text,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  trial_ends_at              timestamptz,
  cancel_at_period_end       boolean not null default false,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists idx_subscriptions_agent_id on public.subscriptions(agent_id);
create index if not exists idx_subscriptions_paystack_subscription_code on public.subscriptions(paystack_subscription_code);

-- Generic per-agent/per-period counter for quota'd actions that don't
-- already have a durable row of their own (practice questions). Timed-test
-- quota is derived straight from operations.created_at instead — no
-- counter needed there.
create table if not exists public.usage_counters (
  id          uuid primary key default uuid_generate_v4(),
  agent_id    uuid not null references public.agents(id) on delete cascade,
  counter_key text not null,
  period_type text not null check (period_type in ('day', 'month')),
  period_key  text not null,
  count       integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (agent_id, counter_key, period_type, period_key)
);

create index if not exists idx_usage_counters_agent_id on public.usage_counters(agent_id);
