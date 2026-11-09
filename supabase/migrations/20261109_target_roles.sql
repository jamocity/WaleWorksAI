-- WaleWorks AI: capture a student's specific IT role interests.
-- Safe to run on an existing WaleWorks AI database. Run once in Supabase SQL Editor.

alter table public.profiles
  add column if not exists target_roles text[] not null default '{}';

create index if not exists profiles_target_roles_gin_idx
  on public.profiles using gin (target_roles);
