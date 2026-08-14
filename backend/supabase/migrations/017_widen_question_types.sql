-- v4 §1. Fresh installs have no Admin CMS `questions` table (v3 §5 / migration 012).
-- Create it with the widened type list. If it already exists, drop+add the check
-- in one transaction so alpha/beta/gamma/delta rows stay valid.

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'questions'
  ) then
    create table public.questions (
      id                 text primary key,
      type               text not null check (type in (
                           'alpha','beta','gamma','delta',
                           'epsilon','zeta','eta','theta'
                         )),
      difficulty         text not null default 'medium',
      category           text,
      operation_context  text,
      payload            jsonb not null default '{}'::jsonb,
      explanation        text,
      rubric             text,
      xp_value           integer not null default 50,
      tags               text[] not null default '{}',
      created_at         timestamptz not null default now(),
      updated_at         timestamptz not null default now()
    );

    alter table public.questions enable row level security;

    create policy "Anyone can read questions"
      on public.questions for select
      using (true);
  else
    alter table public.questions drop constraint if exists questions_type_check;
    alter table public.questions add constraint questions_type_check
      check (type in ('alpha','beta','gamma','delta','epsilon','zeta','eta','theta'));
  end if;
end $$;
