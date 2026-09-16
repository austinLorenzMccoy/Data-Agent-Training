-- Safety-net reconciliation only. The Paystack webhook is the real source
-- of truth for subscription status; this daily job just catches rows that
-- fell out of sync because a webhook delivery was missed. No pg_net/HTTP
-- call here on purpose — this project has no Postgres-to-HTTP precedent,
-- so anything needing to call Paystack happens from a Next.js API route.

create extension if not exists pg_cron;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dna-subscription-expiry';

select cron.schedule(
  'dna-subscription-expiry',
  '15 12 * * *',
  $$
  update public.subscriptions
  set plan_id = 1, status = 'canceled'
  where cancel_at_period_end = true
    and current_period_end is not null
    and current_period_end < now();

  update public.subscriptions
  set status = 'past_due'
  where status = 'trialing'
    and trial_ends_at is not null
    and trial_ends_at < now() - interval '2 days';
  $$
);
