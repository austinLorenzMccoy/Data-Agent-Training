-- Certificates for passed timed tests, each with a public check link.
-- Issued only by the server when it writes a passing result. The code is
-- the public identifier; anyone with it can verify the certificate through
-- /verify/<code>, which reads with the service role.

create table if not exists public.certificates (
  code               text primary key,
  agent_id           uuid not null references public.agents(id) on delete cascade,
  operation_id       uuid not null unique references public.operations(id) on delete cascade,
  track              text not null,
  operation_name     text not null,
  display_name       text not null,
  score              integer not null,
  integrity_verified boolean not null default true,
  org_exam_id        uuid,
  issued_at          timestamptz not null default now(),
  revoked_at         timestamptz,
  revoked_reason     text
);

create index if not exists idx_certificates_agent on public.certificates(agent_id, issued_at desc);

alter table public.certificates enable row level security;

drop policy if exists "Agents can read own certificates" on public.certificates;
create policy "Agents can read own certificates"
  on public.certificates for select
  using (auth.uid() = agent_id);
