# Career preferences and workday simulations setup

## Existing Supabase project

Run this migration once in Supabase Dashboard → SQL Editor:

`supabase/migrations/20261109_target_roles.sql`

It adds `profiles.target_roles` with an empty-array default and a GIN index. It does not delete or rebuild student records.

## Product behavior

- Students select one or more broad IT career areas.
- Students select a primary career area.
- Students select one or more specific job roles within those areas.
- The dashboard prioritises the simulation matching a selected role, then the primary career area, then other selected interests.
- The simulation catalogue orders role-matched scenarios first and keeps all scenarios available for exploration.

## Simulation format

Each guided workday simulation contains a fictional workplace context, workday timeline, decision questions, best-practice explanations, and a practical written deliverable. Multiple-choice feedback is rule-based. Free-text deliverables are stored for later reflection; this version does not claim to grade the written response. The simulations are educational practice, not live employer work, certification, or employment verification.
