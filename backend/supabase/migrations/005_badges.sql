-- Badge definitions reference table
create table public.badge_definitions (
  id          text primary key,
  label       text not null,
  description text not null,
  icon        text not null,
  category    text not null,
  requirement jsonb not null default '{}'
);

insert into public.badge_definitions (id, label, description, icon, category, requirement) values
  ('first_operation',    'First Operation',      'Completed your first Live Operation',        '🎯', 'achievement', '{"operations_count": 1}'),
  ('first_pass',         'Cleared',              'Passed a Live Operation for the first time', '✅', 'achievement', '{"passed": true}'),
  ('perfect_score',      'Perfect Intelligence', 'Scored 100% on a Live Operation',            '⬡', 'achievement', '{"iq_score": 100}'),
  ('streak_3',           'Hot Streak',           '3 correct answers in a row',                 '🔥', 'streak',      '{"streak": 3}'),
  ('streak_10',          'Unstoppable',          '10 correct answers in a row',                '⚡', 'streak',      '{"streak": 10}'),
  ('rank_operative',     'Operative',            'Reached Operative rank',                     '◈', 'rank',        '{"rank_tier_id": 2}'),
  ('rank_field_agent',   'Field Agent',          'Reached Field Agent rank',                   '◆', 'rank',        '{"rank_tier_id": 3}'),
  ('rank_specialist',    'Specialist',           'Reached Specialist rank',                    '✦', 'rank',        '{"rank_tier_id": 4}'),
  ('rank_analyst',       'Analyst',              'Reached Analyst rank',                       '⬡', 'rank',        '{"rank_tier_id": 5}'),
  ('rank_senior_analyst','Senior Analyst',       'Reached Senior Analyst rank',                '★', 'rank',        '{"rank_tier_id": 6}'),
  ('rank_director',      'Intelligence Director','Reached the highest rank',                   '⬡★','rank',        '{"rank_tier_id": 7}');

-- Agent earned badges
create table public.agent_badges (
  id        uuid primary key default uuid_generate_v4(),
  agent_id  uuid not null references public.agents(id) on delete cascade,
  badge_id  text not null references public.badge_definitions(id),
  earned_at timestamptz not null default now(),
  unique(agent_id, badge_id)
);

create index idx_agent_badges_agent on public.agent_badges(agent_id);
