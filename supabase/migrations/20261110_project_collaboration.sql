-- WaleWorks AI: consent-based project collaboration.
-- Additive migration for existing databases. No tables or student records are dropped.

-- Used by RLS policies without exposing the underlying membership rows.
create or replace function public.is_accepted_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.project_contributors pc
    where pc.project_id = p_project_id
      and pc.user_id = auth.uid()
      and pc.invitation_status = 'accepted'::public.invitation_status
  );
$$;
revoke all on function public.is_accepted_project_member(uuid) from public;
revoke all on function public.is_accepted_project_member(uuid) from anon;
grant execute on function public.is_accepted_project_member(uuid) to authenticated;

-- Project owners can invite an existing WaleWorks account by email.
-- The invite is attached to a user ID and delivered through the in-app inbox.
create or replace function public.send_project_invitation(
  p_project_id uuid,
  p_invited_email text,
  p_responsibility text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_invitee uuid;
  v_invitation_id uuid;
  v_existing_status public.invitation_status;
  v_project_title text;
  v_email text := lower(trim(coalesce(p_invited_email, '')));
  v_responsibility text := nullif(trim(coalesce(p_responsibility, '')), '');
begin
  if v_actor is null then
    raise exception 'You must be signed in to invite a teammate.';
  end if;
  if v_email = '' or length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid email address.';
  end if;
  if v_responsibility is not null and length(v_responsibility) > 120 then
    raise exception 'Responsibility must be 120 characters or fewer.';
  end if;

  select p.title into v_project_title
  from public.projects p
  where p.id = p_project_id and p.owner_id = v_actor;
  if not found then
    raise exception 'Only the project owner can invite teammates.';
  end if;

  select u.id into v_invitee
  from auth.users u
  join public.profiles pr on pr.id = u.id
  where lower(u.email) = v_email
    and u.email_confirmed_at is not null
  limit 1;

  if v_invitee is null then
    raise exception 'No WaleWorks account was found for this email. Ask the person to register first.';
  end if;
  if v_invitee = v_actor then
    raise exception 'You are already the owner of this project.';
  end if;

  select pc.id, pc.invitation_status
    into v_invitation_id, v_existing_status
  from public.project_contributors pc
  where pc.project_id = p_project_id
    and (pc.user_id = v_invitee or lower(pc.invited_email) = v_email)
  order by pc.created_at desc
  limit 1
  for update;

  if v_invitation_id is not null and v_existing_status = 'accepted'::public.invitation_status then
    raise exception 'This person is already a project teammate.';
  elsif v_invitation_id is not null and v_existing_status = 'pending'::public.invitation_status then
    raise exception 'An invitation is already pending for this person.';
  elsif v_invitation_id is not null then
    update public.project_contributors
      set user_id = v_invitee,
          invited_email = v_email,
          responsibility = v_responsibility,
          invitation_status = 'pending'::public.invitation_status,
          invited_by = v_actor,
          accepted_at = null,
          created_at = now()
    where id = v_invitation_id;
  else
    insert into public.project_contributors (
      project_id, user_id, invited_email, responsibility,
      invitation_status, invited_by
    ) values (
      p_project_id, v_invitee, v_email, v_responsibility,
      'pending'::public.invitation_status, v_actor
    ) returning id into v_invitation_id;
  end if;

  insert into public.notifications (user_id, type, title, body, href)
  values (
    v_invitee,
    'project_invitation',
    'Project team invitation',
    'You have been invited to collaborate on "' || v_project_title || '". Review the invitation to accept or decline.',
    '/dashboard/invitations'
  );

  return v_invitation_id;
end;
$$;
revoke all on function public.send_project_invitation(uuid, text, text) from public;
revoke all on function public.send_project_invitation(uuid, text, text) from anon;
grant execute on function public.send_project_invitation(uuid, text, text) to authenticated;

-- Return only the invitation preview fields to the signed-in invitee.
-- A pending invitation does not grant access to the full private project row.
create or replace function public.get_my_project_invitations()
returns table (
  id uuid,
  project_id uuid,
  project_title text,
  responsibility text,
  invitation_status public.invitation_status,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select pc.id, pc.project_id, p.title, pc.responsibility, pc.invitation_status, pc.created_at
  from public.project_contributors pc
  join public.projects p on p.id = pc.project_id
  where pc.user_id = auth.uid()
    and pc.invitation_status in ('pending'::public.invitation_status, 'accepted'::public.invitation_status)
  order by pc.created_at desc
  limit 50;
$$;
revoke all on function public.get_my_project_invitations() from public;
revoke all on function public.get_my_project_invitations() from anon;
grant execute on function public.get_my_project_invitations() to authenticated;

-- Only the invited account can accept or decline its own pending invitation.
create or replace function public.respond_to_project_invitation(
  p_invitation_id uuid,
  p_response text
)
returns public.invitation_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_invitation public.project_contributors%rowtype;
  v_project_title text;
begin
  if v_actor is null then
    raise exception 'You must be signed in to respond to an invitation.';
  end if;
  if p_response is null or p_response not in ('accepted', 'declined') then
    raise exception 'Choose accept or decline.';
  end if;

  select * into v_invitation
  from public.project_contributors pc
  where pc.id = p_invitation_id
    and pc.user_id = v_actor
    and pc.invitation_status = 'pending'::public.invitation_status
  for update;

  if not found then
    raise exception 'This invitation is no longer available.';
  end if;

  update public.project_contributors
  set invitation_status = p_response::public.invitation_status,
      accepted_at = case when p_response = 'accepted' then now() else null end
  where id = p_invitation_id;

  select p.title into v_project_title
  from public.projects p
  where p.id = v_invitation.project_id;

  insert into public.notifications (user_id, type, title, body, href)
  values (
    v_invitation.invited_by,
    'project_invitation_response',
    case when p_response = 'accepted' then 'Invitation accepted' else 'Invitation declined' end,
    coalesce((select full_name from public.profiles where id = v_actor), 'A WaleWorks member')
      || case when p_response = 'accepted' then ' accepted the invitation to "' else ' declined the invitation to "' end
      || coalesce(v_project_title, 'your project') || '".',
    '/dashboard/projects/' || v_invitation.project_id::text || '/workspace'
  );

  return p_response::public.invitation_status;
end;
$$;
revoke all on function public.respond_to_project_invitation(uuid, text) from public;
revoke all on function public.respond_to_project_invitation(uuid, text) from anon;
grant execute on function public.respond_to_project_invitation(uuid, text) to authenticated;

-- Accepted members can read private projects while they remain on the team.
-- Pending invitations expose only the limited preview returned by get_my_project_invitations().
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Accepted teammates view projects') then
    execute $policy$
      create policy "Accepted teammates view projects" on public.projects for select to authenticated
      using (public.is_accepted_project_member(id))
    $policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'project_contributors' and policyname = 'Accepted teammates view team roster') then
    execute $policy$
      create policy "Accepted teammates view team roster" on public.project_contributors for select to authenticated
      using (public.is_accepted_project_member(project_id))
    $policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'project_milestones' and policyname = 'Accepted teammates view milestones') then
    execute $policy$
      create policy "Accepted teammates view milestones" on public.project_milestones for select to authenticated
      using (public.is_accepted_project_member(project_id))
    $policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'contributions' and policyname = 'Accepted teammates view contributions') then
    execute $policy$
      create policy "Accepted teammates view contributions" on public.contributions for select to authenticated
      using (public.is_accepted_project_member(project_id))
    $policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'project_comments' and policyname = 'Project teams view comments') then
    execute $policy$
      create policy "Project teams view comments" on public.project_comments for select to authenticated
      using (public.is_accepted_project_member(project_id))
    $policy$;
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'project_comments' and policyname = 'Project teams add comments') then
    execute $policy$
      create policy "Project teams add comments" on public.project_comments for insert to authenticated
      with check (
        author_id = auth.uid()
        and (
          exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
          or public.is_accepted_project_member(project_id)
        )
      )
    $policy$;
  end if;
end $$;

comment on function public.send_project_invitation(uuid, text, text) is
'Creates a pending project invitation for an existing WaleWorks account and sends an in-app notification.';
comment on function public.respond_to_project_invitation(uuid, text) is
'Allows only the invited account to explicitly accept or decline its pending project invitation.';
comment on function public.get_my_project_invitations() is
'Returns a limited invitation preview for the currently authenticated user without revealing private project contents.';

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'project_files' and policyname = 'Accepted teammates view project file records') then
    execute $policy$
      create policy "Accepted teammates view project file records" on public.project_files for select to authenticated
      using (public.is_accepted_project_member(project_id))
    $policy$;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Accepted teammates read project assets') then
    execute $policy$
      create policy "Accepted teammates read project assets" on storage.objects for select to authenticated
      using (
        bucket_id = 'project-assets'
        and exists (
          select 1 from public.projects p
          where p.id::text = (storage.foldername(name))[2]
            and public.is_accepted_project_member(p.id)
        )
      )
    $policy$;
  end if;
end $$;

notify pgrst, 'reload schema';
