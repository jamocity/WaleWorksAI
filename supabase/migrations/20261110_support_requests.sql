-- WaleWorks AI support and feedback inbox.
-- Additive and safe to re-run. Existing student/project records are untouched.

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('bug','account','project','simulation','idea','other')),
  subject text not null check (char_length(subject) between 4 and 120),
  message text not null check (char_length(message) between 20 and 4000),
  status text not null default 'open' check (status in ('open','in_review','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_user_created_idx
  on public.support_requests (user_id, created_at desc);

alter table public.support_requests enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'support_requests' and policyname = 'Users view own support requests') then
    create policy "Users view own support requests"
      on public.support_requests for select to authenticated
      using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'support_requests' and policyname = 'Users submit own support requests') then
    create policy "Users submit own support requests"
      on public.support_requests for insert to authenticated
      with check (user_id = auth.uid() and status = 'open');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'support_requests' and policyname = 'Admins manage support requests') then
    create policy "Admins manage support requests"
      on public.support_requests for all to authenticated
      using (exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      ))
      with check (exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      ));
  end if;
end $$;

grant select, insert, update on public.support_requests to authenticated;

-- Reuse the existing timestamp trigger function from the WaleWorks base schema.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'support_requests_set_updated_at') then
    create trigger support_requests_set_updated_at
      before update on public.support_requests
      for each row execute function public.set_updated_at();
  end if;
end $$;

comment on table public.support_requests is
  'Private student support and feedback requests. Students can create and read their own requests; admins can manage all requests.';
