import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, FolderKanban } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectWorkboard } from '@/components/project-workboard';
import { createClient } from '@/lib/supabase/server';

type Milestone = { id: string; title: string; description: string | null; due_date: string | null; completed_at: string | null; position: number; created_at: string };
type Contribution = { id: string; contribution_type: string; title: string; details: string | null; evidence_url: string | null; created_at: string };

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: project } = await supabase.from('projects').select('id,title,owner_id').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!project) notFound();
  const [{ data: milestoneRows, error: milestoneError }, { data: contributionRows, error: contributionError }] = await Promise.all([
    supabase.from('project_milestones').select('id,title,description,due_date,completed_at,position,created_at').eq('project_id', id).order('position', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('contributions').select('id,contribution_type,title,details,evidence_url,created_at').eq('project_id', id).order('created_at', { ascending: false }),
  ]);
  return <div className="dashboard-page project-workspace-page"><Link className="back-link" href={`/dashboard/projects/${id}`}><ArrowLeft size={15}/> Back to project</Link><SectionHeading eyebrow="PROJECT WORKSPACE" title={project.title} description="Plan the work, record progress and build a clear history of your contribution." action={<Link href={`/dashboard/projects/${id}`} className="button button-secondary"><FolderKanban size={15}/> Project details</Link>}/>
    {(milestoneError || contributionError) ? <div className="form-alert error">The project workboard tables could not be loaded. Check that project_milestones and contributions are present in Supabase and that the Phase 2 policies from schema.sql were applied.</div> : <ProjectWorkboard projectId={id} userId={user.id} milestones={(milestoneRows ?? []) as Milestone[]} contributions={(contributionRows ?? []) as Contribution[]}/>}
    <div className="workboard-guidance"><CalendarDays size={16}/><p>Use milestones for planned outcomes and the contribution log for work you have actually completed. Do not claim uncompleted tasks as experience.</p></div>
  </div>;
}
