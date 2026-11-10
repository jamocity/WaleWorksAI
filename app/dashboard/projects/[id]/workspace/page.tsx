import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, FolderKanban } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectWorkboard } from '@/components/project-workboard';
import { ProjectCollaborationPanel } from '@/components/project-collaboration-panel';
import { createClient } from '@/lib/supabase/server';

type Milestone = { id: string; title: string; description: string | null; due_date: string | null; completed_at: string | null; position: number; created_at: string };
type Contribution = { id: string; user_id: string; contribution_type: string; title: string; details: string | null; evidence_url: string | null; created_at: string };
type ContributorRow = { id: string; user_id: string | null; invited_email?: string | null; responsibility: string | null; invitation_status: string; created_at: string };
type CommentRow = { id: string; author_id: string; body: string; created_at: string };
type PublicProfile = { id: string; full_name: string | null };

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: project } = await supabase.from('projects').select('id,title,owner_id').eq('id', id).maybeSingle();
  if (!project) notFound();
  const isOwner = project.owner_id === user.id;
  const { data: membership } = isOwner ? { data: null } : await supabase
    .from('project_contributors').select('id').eq('project_id', id).eq('user_id', user.id).eq('invitation_status', 'accepted').maybeSingle();
  if (!isOwner && !membership) notFound();

  const [milestoneResponse, contributionResponse, contributorResponse, commentResponse] = await Promise.all([
    supabase.from('project_milestones').select('id,title,description,due_date,completed_at,position,created_at').eq('project_id', id).order('position', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('contributions').select('id,user_id,contribution_type,title,details,evidence_url,created_at').eq('project_id', id).order('created_at', { ascending: false }),
    // Keep this select literal so Supabase's TypeScript query parser can infer the row shape.
    // Invitation emails are fetched separately and only for the project owner.
    supabase.from('project_contributors').select('id,user_id,responsibility,invitation_status,created_at').eq('project_id', id).order('created_at', { ascending: true }),
    supabase.from('project_comments').select('id,author_id,body,created_at').eq('project_id', id).order('created_at', { ascending: true }).limit(100),
  ]);

  let pendingInviteRows: Array<{ id: string; invited_email: string | null }> = [];
  let pendingInviteError: { message: string } | null = null;
  if (isOwner) {
    const pendingInviteResponse = await supabase
      .from('project_contributors')
      .select('id,invited_email')
      .eq('project_id', id)
      .eq('invitation_status', 'pending');
    pendingInviteRows = pendingInviteResponse.data ?? [];
    pendingInviteError = pendingInviteResponse.error;
  }
  const pendingInviteEmails = new Map(pendingInviteRows.map((row) => [row.id, row.invited_email]));
  const contributorRows: ContributorRow[] = (contributorResponse.data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    invited_email: pendingInviteEmails.get(row.id) ?? null,
    responsibility: row.responsibility,
    invitation_status: row.invitation_status,
    created_at: row.created_at,
  }));
  const profileIds = [...new Set([
    ...contributorRows.map((item) => item.user_id).filter((value): value is string => Boolean(value)),
    ...(commentResponse.data ?? []).map((item) => item.author_id),
  ])];
  const { data: publicProfiles } = profileIds.length
    ? await supabase.from('public_profiles').select('id,full_name').in('id', profileIds)
    : { data: [] as PublicProfile[] };
  const profileNames = new Map(((publicProfiles ?? []) as PublicProfile[]).map((profile) => [profile.id, profile.full_name]));

  const members = contributorRows.map((item) => ({
    ...item,
    display_name: item.user_id ? profileNames.get(item.user_id) ?? null : null,
  }));
  const comments = ((commentResponse.data ?? []) as CommentRow[]).map((item) => ({
    ...item,
    author_name: profileNames.get(item.author_id) ?? null,
  }));
  const boardError = milestoneResponse.error || contributionResponse.error || contributorResponse.error || commentResponse.error || pendingInviteError;

  return <div className="dashboard-page project-workspace-page">
    <Link className="back-link" href={`/dashboard/projects/${id}`}><ArrowLeft size={15}/> Back to project</Link>
    <SectionHeading eyebrow="PROJECT WORKSPACE" title={project.title} description="Coordinate with teammates, plan the work, discuss decisions and record each person's contribution." action={<Link href={`/dashboard/projects/${id}`} className="button button-secondary"><FolderKanban size={15}/> Project details</Link>}/>
    {boardError ? <div className="form-alert error">Some collaboration data could not be loaded: {(boardError as { message?: string }).message ?? 'Check that the project collaboration migration has been applied.'}</div> : <>
      <ProjectCollaborationPanel projectId={id} isOwner={isOwner} members={members} comments={comments}/>
      <ProjectWorkboard projectId={id} userId={user.id} isOwner={isOwner} milestones={(milestoneResponse.data ?? []) as Milestone[]} contributions={(contributionResponse.data ?? []) as Contribution[]}/>
    </>}
    <div className="workboard-guidance"><CalendarDays size={16}/><p>Project owners control membership and milestones. Accepted teammates can participate in discussion and record their own work. Only claim contributions you personally completed.</p></div>
  </div>;
}
