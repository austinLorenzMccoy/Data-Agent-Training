-- Daily heartbeat so the project has scheduled database work.
-- Also run the Vercel / GitHub keep-alive ping — inbound REST is what
-- the platform counts as activity and is what actually prevents a pause.

create extension if not exists pg_cron;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dna-keep-alive';

select cron.schedule(
  'dna-keep-alive',
  '0 12 * * *',
  $$select 1$$
);
