-- WaleWorks AI — Supabase / PostgreSQL schema
-- Run this file in the Supabase SQL Editor for a new project.

create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'mentor', 'employer', 'admin');
create type public.project_visibility as enum ('public', 'private', 'unlisted');
create type public.project_status as enum ('planning', 'in_progress', 'completed');
create type public.invitation_status as enum ('pending', 'accepted', 'declined');
create type public.challenge_status as enum ('draft', 'published', 'closed');
create type public.submission_status as enum ('submitted', 'under_review', 'reviewed');

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (university_id, name)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  full_name text not null default '',
  university text,
  university_id uuid references public.universities(id) on delete set null,
  department text,
  department_id uuid references public.departments(id) on delete set null,
  academic_level text,
  bio text check (char_length(bio) <= 1200),
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  achievements text[] not null default '{}',
  certifications text[] not null default '{}',
  avatar_url text,
  location text,
  role public.app_role not null default 'student',
  is_public boolean not null default false,
  show_email boolean not null default false,
  professional_visibility boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_private (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  contact_email text,
  updated_at timestamptz not null default now()
);

create table public.portfolio_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  show_academic_background boolean not null default true,
  show_skills boolean not null default true,
  show_collaborations boolean not null default true,
  show_achievements boolean not null default true,
  show_certifications boolean not null default true,
  show_reviews boolean not null default true,
  custom_intro text,
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  slug text not null,
  description text not null default '' check (char_length(description) <= 3000),
  problem_statement text,
  objectives text[] not null default '{}',
  methodology text,
  category text not null default 'Personal Project',
  discipline text not null default 'Other',
  status public.project_status not null default 'planning',
  visibility public.project_visibility not null default 'private',
  outcomes text,
  lessons_learned text,
  skills text[] not null default '{}',
  external_links text[] not null default '{}',
  cover_image_url text,
  featured boolean not null default false,
  started_at date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index projects_owner_updated_idx on public.projects(owner_id, updated_at desc);
create index projects_public_discipline_idx on public.projects(discipline, status) where visibility = 'public';

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table public.project_contributors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_email text,
  responsibility text,
  invitation_status public.invitation_status not null default 'pending',
  invited_by uuid not null references public.profiles(id) on delete cascade,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (user_id is not null or invited_email is not null)
);

create unique index project_contributor_user_unique on public.project_contributors(project_id, user_id) where user_id is not null;
create unique index project_contributor_email_unique on public.project_contributors(project_id, lower(invited_email)) where invited_email is not null;

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  contribution_type text not null,
  title text not null,
  details text,
  evidence_url text,
  created_at timestamptz not null default now()
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'General'
);

create table public.student_skills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  proficiency text,
  evidence_project_id uuid references public.projects(id) on delete set null,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, skill_id)
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  discipline text not null,
  difficulty text not null default 'Intermediate',
  organisation text,
  deadline date,
  status public.challenge_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  submission_note text,
  status public.submission_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  unique (challenge_id, student_id)
);

create table public.ai_assessments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  model_name text not null,
  rubric_version text not null,
  result jsonb not null,
  disclaimer text not null default 'AI-generated guidance only. Not a professional certification or human-verified assessment.',
  created_at timestamptz not null default now()
);

create table public.human_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  review_text text not null,
  rating numeric(3,1) check (rating is null or rating between 0 and 5),
  reviewer_role text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.employer_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  organisation_name text not null,
  website text,
  organisation_description text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

-- Only administrators or trusted server code can change a user's role.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' and new.role <> 'student' then
      raise exception 'New accounts must start with the student role.';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Role changes require trusted server-side administration.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation before insert or update of role on public.profiles
for each row execute function public.prevent_role_escalation();

-- Student-created reviews can never self-label as verified. Trusted server code may verify them.
create or replace function public.enforce_review_verification()
returns trigger language plpgsql as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.verified := false;
  end if;
  return new;
end;
$$;

create trigger human_reviews_force_unverified before insert or update on public.human_reviews
for each row execute function public.enforce_review_verification();

-- New auth users receive a profile. Username is stable and can be edited later in profile settings.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  safe_username text;
begin
  base_username := lower(coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1), 'student'));
  safe_username := regexp_replace(base_username, '[^a-z0-9_-]', '-', 'g');
  safe_username := regexp_replace(safe_username, '^[^a-z0-9]+', '', 'g');
  safe_username := trim(both '-' from safe_username);
  safe_username := left(safe_username, 20);
  if length(safe_username) < 3 then safe_username := 'student'; end if;

  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    safe_username || '-' || substr(replace(new.id::text, '-', ''), 1, 5),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'student'
  );

  insert into public.profile_private (profile_id, contact_email)
  values (new.id, new.email);

  insert into public.portfolio_settings (profile_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS is enabled on all user-facing tables.
alter table public.universities enable row level security;
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.portfolio_settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.project_contributors enable row level security;
alter table public.contributions enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_comments enable row level security;
alter table public.skills enable row level security;
alter table public.student_skills enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_submissions enable row level security;
alter table public.ai_assessments enable row level security;
alter table public.human_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.employer_profiles enable row level security;

-- Public institution and skills directories.
create policy "Active universities are readable" on public.universities for select using (is_active = true);
create policy "Departments are readable" on public.departments for select using (true);
create policy "Skills are readable" on public.skills for select using (true);

-- Contact email is held separately so a public profile query cannot leak it when display is disabled.
create policy "Private contact details only visible to owner" on public.profile_private for select
using (profile_id = auth.uid());
create policy "Owners manage private contact details" on public.profile_private for all
using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Keep this view as a security-definer view (security_invoker = false): it intentionally
-- reads owner-only base tables, while projecting only fields that are safe for public visitors.
create or replace view public.public_profiles
with (security_barrier = true, security_invoker = false) as
select
  p.id,
  p.username,
  p.full_name,
  case when coalesce(ps.show_academic_background, true) then p.university else null end as university,
  case when coalesce(ps.show_academic_background, true) then p.university_id else null end as university_id,
  case when coalesce(ps.show_academic_background, true) then p.department else null end as department,
  case when coalesce(ps.show_academic_background, true) then p.department_id else null end as department_id,
  case when coalesce(ps.show_academic_background, true) then p.academic_level else null end as academic_level,
  p.bio,
  case when coalesce(ps.show_skills, true) then p.interests else '{}'::text[] end as interests,
  case when coalesce(ps.show_skills, true) then p.skills else '{}'::text[] end as skills,
  case when coalesce(ps.show_achievements, true) then p.achievements else '{}'::text[] end as achievements,
  case when coalesce(ps.show_certifications, true) then p.certifications else '{}'::text[] end as certifications,
  p.avatar_url,
  case when coalesce(ps.show_academic_background, true) then p.location else null end as location,
  p.role,
  p.is_public,
  p.show_email,
  p.professional_visibility,
  p.onboarding_complete,
  p.created_at,
  case when p.show_email then pp.contact_email else null end as contact_email
from public.profiles p
left join public.profile_private pp on pp.profile_id = p.id
left join public.portfolio_settings ps on ps.profile_id = p.id
where p.is_public = true and p.onboarding_complete = true;
comment on view public.public_profiles is
  'Public-safe profile projection. Hidden sections are nulled/emptied before API exposure; contact email is conditional.';
revoke all on public.public_profiles from public;
grant select on public.public_profiles to anon, authenticated;

-- Base profile rows are owner-only. Anonymous visitors receive only the filtered public_profiles view.
create policy "Profiles visible to owner" on public.profiles for select
using (id = auth.uid());
create policy "Users create own profile" on public.profiles for insert
with check (id = auth.uid() and role = 'student');
create policy "Users update own profile" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

create policy "Portfolio settings owner or public" on public.portfolio_settings for select
using (
  profile_id = auth.uid() or exists (
    select 1 from public.public_profiles p where p.id = profile_id
  )
);
create policy "Owners manage portfolio settings" on public.portfolio_settings for all
using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Public and unlisted projects are URL-accessible; private projects stay with their owner.
-- Unlisted is link privacy, not confidentiality: do not store sensitive material in it.
create policy "Projects visible by privacy or membership" on public.projects for select
using (
  owner_id = auth.uid() or visibility in ('public', 'unlisted')
);
create policy "Owners create projects" on public.projects for insert
with check (owner_id = auth.uid());
create policy "Owners update projects" on public.projects for update
using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners delete projects" on public.projects for delete
using (owner_id = auth.uid());

create policy "Project files visible with project access" on public.project_files for select
using (
  owner_id = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.visibility in ('public', 'unlisted'))
);
create policy "Owners add project files" on public.project_files for insert
with check (
  owner_id = auth.uid()
  and storage_path like (auth.uid()::text || '/' || project_id::text || '/%')
  and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "Owners remove project files" on public.project_files for delete
using (owner_id = auth.uid());

-- Collaboration tables provide Phase 2 storage and guarded owner/team access; invitee acceptance and public summaries are not enabled in Phase 1.
create policy "Project contributors visible to team" on public.project_contributors for select
using (user_id = auth.uid() or invited_by = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Project owners create pending invitations" on public.project_contributors for insert
with check (
  invited_by = auth.uid()
  and invitation_status = 'pending'
  and accepted_at is null
  and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
-- No client update policy is enabled: a project owner must not mark an invitation accepted.
-- Phase 2 will add a verified invitee-acceptance flow with explicit consent.
create policy "Project owners remove contributors" on public.project_contributors for delete
using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- Phase 2 contribution records are private to their author and project owner until
-- a purpose-built public contribution view can respect contributor visibility settings.
create policy "Contributions visible to author or project owner" on public.contributions for select
using (
  user_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "Users add own contribution" on public.contributions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = project_id
      and (p.owner_id = auth.uid() or exists (
        select 1 from public.project_contributors pc
        where pc.project_id = project_id and pc.user_id = auth.uid() and pc.invitation_status = 'accepted'
      ))
  )
);
-- Contribution updates are intentionally disabled in Phase 1; add a column-limited update flow in Phase 2.

-- Milestones stay inside the team workspace in Phase 1; public milestone presentation is a Phase 2 view.
create policy "Project owners read milestones" on public.project_milestones for select
using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "Owners manage milestones" on public.project_milestones for all
using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- Project updates are not public until the Phase 2 activity feed is implemented.
create policy "Project owners or update authors read updates" on public.project_updates for select
using (
  author_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "Owners publish project updates" on public.project_updates for insert
with check (author_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

-- Comments are held for Phase 2; no direct public insert/read path is enabled in the MVP.
create policy "Project owners or comment authors read comments" on public.project_comments for select
using (
  author_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "Comment authors remove own comments" on public.project_comments for delete
using (author_id = auth.uid());

-- Structured skill evidence is private until a visibility-aware portfolio view is added.
create policy "Students view own skill records" on public.student_skills for select
using (student_id = auth.uid());
create policy "Students manage own skill records" on public.student_skills for all
using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "Published challenges are readable" on public.challenges for select
using (status = 'published' or created_by = auth.uid());
-- Only provisioned mentors and administrators can publish challenge records.
create policy "Mentors and admins manage challenges" on public.challenges for all
using (
  created_by = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('mentor','admin'))
)
with check (
  created_by = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('mentor','admin'))
);
create policy "Students view own challenge submissions" on public.challenge_submissions for select
using (student_id = auth.uid());
create policy "Students submit to published challenges" on public.challenge_submissions for insert
with check (
  student_id = auth.uid()
  and status = 'submitted'
  and exists (select 1 from public.challenges c where c.id = challenge_id and c.status = 'published')
  and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
);

-- AI assessment results are owner-only until Phase 3 public review settings and summaries exist.
create policy "AI assessments visible to owner" on public.ai_assessments for select
using (student_id = auth.uid());
-- Human reviews stay private to the project owner and reviewer until reviewer identity/consent rules are implemented.
create policy "Human reviews visible to owner or reviewer" on public.human_reviews for select
using (
  reviewer_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
-- Human review creation is reserved for a trusted, invitation-aware server workflow in a later phase.

create policy "Users view own notifications" on public.notifications for select
using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Employers view own employer profile" on public.employer_profiles for select
using (id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'));
create policy "Employers manage own employer profile" on public.employer_profiles for all
using (id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'))
with check (id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'));

-- Profile avatars are public images; each user can upload only into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880;

create policy "Users upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Avatars are publicly readable" on storage.objects for select
using (bucket_id = 'avatars');
create policy "Users update own avatar" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Private object storage. Object paths: <owner_uuid>/<project_uuid>/<filename>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-assets',
  'project-assets',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','video/mp4']
)
on conflict (id) do update set public = false, file_size_limit = 15728640;

create policy "Users upload files to own project folder" on storage.objects for insert to authenticated
with check (
  bucket_id = 'project-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.projects p
    where p.id::text = (storage.foldername(name))[2] and p.owner_id = auth.uid()
  )
);
create policy "Owners or public project viewers read files" on storage.objects for select
using (
  bucket_id = 'project-assets'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[2] and p.visibility in ('public','unlisted')
    )
  )
);
create policy "Owners delete project files from storage" on storage.objects for delete to authenticated
using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);

-- Seed Wale University as the pilot institution. This is a directory record, not a student account.
insert into public.universities (name, slug) values ('Wale University', 'wale-university')
on conflict (slug) do nothing;


-- Explicit grants make the API permissions predictable on fresh Supabase projects.
-- Row-level security policies above still decide which records each role can access.
grant usage on schema public to anon, authenticated;
grant select on public.universities, public.departments, public.skills to anon, authenticated;
grant select on public.profiles, public.portfolio_settings, public.projects, public.project_files,
  public.student_skills, public.human_reviews to anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

grant select, insert, update, delete on public.profiles, public.profile_private, public.portfolio_settings,
  public.projects, public.project_files, public.project_contributors, public.contributions,
  public.project_milestones, public.project_updates, public.project_comments, public.student_skills,
  public.challenges, public.challenge_submissions, public.human_reviews, public.notifications,
  public.employer_profiles to authenticated;
grant select on public.ai_assessments to authenticated;
