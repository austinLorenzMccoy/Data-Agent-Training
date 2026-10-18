-- Manual payments: Airtm, Binance Pay (crypto) and Grey, alongside Paystack.
--
-- The learner pays the platform's account directly, then uploads a
-- screenshot and the transaction ID. An admin checks it and approves, which
-- gives the plan for 30 days (added to any time left). Approved periods
-- are marked cancel_at_period_end, so the daily expiry job in 025 moves the
-- learner back to the free plan when the 30 days run out.

-- Price for manual methods, in US cents. Null hides the manual methods for
-- that plan until a price is set, e.g.:
--   update public.billing_plans set price_usd_cents = 500 where slug = 'pro';
alter table public.billing_plans
  add column if not exists price_usd_cents integer;

create table if not exists public.manual_payments (
  id            uuid primary key default uuid_generate_v4(),
  agent_id      uuid not null references public.agents(id) on delete cascade,
  plan_id       smallint not null references public.billing_plans(id),
  method        text not null check (method in ('airtm', 'binance', 'grey')),
  amount_cents  integer not null,
  currency      text not null default 'USD',
  reference     text not null check (length(reference) between 3 and 120),
  proof_path    text not null,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note   text,
  reviewed_by   uuid references auth.users(id) on delete set null,
  reviewed_at   timestamptz,
  period_end    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_manual_payments_status on public.manual_payments(status, created_at);
create index if not exists idx_manual_payments_agent on public.manual_payments(agent_id, created_at desc);
-- The same transaction cannot be claimed twice.
create unique index if not exists idx_manual_payments_reference
  on public.manual_payments(method, lower(reference)) where status <> 'rejected';

alter table public.manual_payments enable row level security;

drop policy if exists "Agents can read own manual payments" on public.manual_payments;
create policy "Agents can read own manual payments"
  on public.manual_payments for select
  using (auth.uid() = agent_id);

-- Proof screenshots: a private bucket. Only the service role reads or
-- writes it; admins see proofs through short-lived signed links.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
