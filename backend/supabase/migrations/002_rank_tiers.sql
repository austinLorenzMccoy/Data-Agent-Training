-- Static reference table for rank definitions
create table public.rank_tiers (
  id          smallint primary key,
  slug        text not null unique,
  label       text not null,
  icon        text not null,
  xp_required integer not null,
  colour_hex  text not null
);

insert into public.rank_tiers (id, slug, label, icon, xp_required, colour_hex) values
  (1, 'recruit',               'Recruit',               '◯', 0,      '#7a7266'),
  (2, 'operative',             'Operative',             '◈', 500,    '#6a9ecf'),
  (3, 'field_agent',           'Field Agent',           '◆', 1500,   '#5aab7a'),
  (4, 'specialist',            'Specialist',            '✦', 3500,   '#c07ab8'),
  (5, 'analyst',               'Analyst',               '⬡', 7000,   '#c8973a'),
  (6, 'senior_analyst',        'Senior Analyst',        '★', 12000,  '#e8a84a'),
  (7, 'intelligence_director', 'Intelligence Director', '⬡★',20000, '#f0d060');
