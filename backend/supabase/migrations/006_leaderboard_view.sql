-- Public leaderboard view — only opt-in agents
create or replace view public.leaderboard as
  select
    a.id,
    a.alias,
    a.total_xp,
    a.best_iq_score,
    a.operations_count,
    rt.label      as rank_label,
    rt.icon       as rank_icon,
    rt.colour_hex as rank_colour,
    rt.id         as rank_tier_id,
    rank() over (order by a.total_xp desc) as position
  from public.agents a
  join public.rank_tiers rt on rt.id = a.rank_tier_id
  where a.leaderboard_opt_in = true
  order by a.total_xp desc;
