import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FilePlus2, FolderKanban, SearchX } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectCard } from '@/components/project-card';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/types';

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  let query = supabase.from('projects').select('*').eq('owner_id', user.id).order('updated_at', { ascending: false });
  const term = q?.trim().replace(/[^a-zA-Z0-9\s-]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  const { data } = await query;
  const projects = (data ?? []) as Project[];
  const publicCount = projects.filter((item) => item.visibility === 'public').length;

  return <div className="dashboard-page"><SectionHeading eyebrow="YOUR REPOSITORY" title="My projects" description="A record of what you are exploring, building and learning." action={<Link href="/dashboard/projects/new" className="button button-primary"><FilePlus2 size={16} /> New project</Link>} />
    <div className="repository-summary"><div><span className="repository-summary-number">{projects.length}</span><span>Total projects</span></div><i /><div><span className="repository-summary-number">{publicCount}</span><span>Public</span></div><i /><div><span className="repository-summary-number">{projects.length - publicCount}</span><span>Private or unlisted</span></div></div>
    {q && <p className="search-results-copy">Showing results for <b>“{q}”</b> · <Link href="/dashboard/projects">Clear search</Link></p>}
    {projects.length ? <div className="project-grid repository-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <div className="empty-state repository-empty"><div className="empty-state-icon">{q ? <SearchX size={22} /> : <FolderKanban size={22} />}</div><h3>{q ? 'No matching projects found.' : 'Your repository is empty.'}</h3><p>{q ? 'Try a different title or description keyword.' : 'Create your first project repository and start building your evidence of practical skills.'}</p>{q ? <Link href="/dashboard/projects" className="button button-secondary">View all projects</Link> : <Link href="/dashboard/projects/new" className="button button-primary">Create a project <FilePlus2 size={16} /></Link>}</div>}
  </div>;
}
