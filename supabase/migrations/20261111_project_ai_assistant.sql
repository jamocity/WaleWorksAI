-- WaleWorks AI Project Assistant: privacy-minimal daily usage counter.
-- Conversation messages and project content are NOT stored in this table.

create table if not exists public.project_ai_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null,
  requests_used integer not null default 0 check (requests_used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.project_ai_usage enable row level security;
revoke all on public.project_ai_usage from anon, authenticated;

create or replace function public.get_project_ai_quota()
returns table (remaining integer, resets_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    greatest(0, 10 - coalesce((
      select u.requests_used
      from public.project_ai_usage u
      where u.user_id = auth.uid()
        and u.usage_date = (timezone('utc', now()))::date
    ), 0))::integer,
    (date_trunc('day', timezone('utc', now())) + interval '1 day') at time zone 'UTC';
$$;
revoke all on function public.get_project_ai_quota() from public;
revoke all on function public.get_project_ai_quota() from anon;
grant execute on function public.get_project_ai_quota() to authenticated;

create or replace function public.consume_project_ai_request()
returns table (allowed boolean, remaining integer, resets_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  insert into public.project_ai_usage as ai_usage (user_id, usage_date, requests_used, updated_at)
  values (v_user_id, (timezone('utc', now()))::date, 1, now())
  on conflict (user_id, usage_date)
  do update set
    requests_used = ai_usage.requests_used + 1,
    updated_at = now()
  where ai_usage.requests_used < 10
  returning ai_usage.requests_used into v_count;

  if v_count is null then
    select u.requests_used into v_count
    from public.project_ai_usage u
    where u.user_id = v_user_id
      and u.usage_date = (timezone('utc', now()))::date;
    return query select false, greatest(0, 10 - coalesce(v_count, 10))::integer,
      (date_trunc('day', timezone('utc', now())) + interval '1 day') at time zone 'UTC';
  else
    return query select true, greatest(0, 10 - v_count)::integer,
      (date_trunc('day', timezone('utc', now())) + interval '1 day') at time zone 'UTC';
  end if;
end;
$$;
revoke all on function public.consume_project_ai_request() from public;
revoke all on function public.consume_project_ai_request() from anon;
grant execute on function public.consume_project_ai_request() to authenticated;

comment on table public.project_ai_usage is
'Per-user daily AI request counts only. Project content and assistant conversations are not stored here.';

notify pgrst, 'reload schema';
