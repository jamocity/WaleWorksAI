import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, CircleDot,
  ExternalLink, FileText, Globe2, LockKeyhole, Pencil, Target,
} from 'lucide-react';
import { ProjectAssets } from '@/components/project-assets';
import { DeleteProjectButton } from '@/components/delete-project-button';
import { CopyLinkButton } from '@/components/copy-link-button';
import { createClient } from '@/lib/supabase/server';
import type { Project, ProjectFile, Profile } from '@/lib/types';
import { formatDate, formatStatus, safeExternalUrl } from '@/lib/utils';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: projectData } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (!projectData) notFound();
  const project = projectData as Project;
  const isOwner = project.owner_id === user.id;
  const { data: membership } = isOwner ? { data: null } : await supabase
    .from('project_contributors').select('id').eq('project_id', id).eq('user_id', user.id).eq('invitation_status', 'accepted').maybeSingle();
  const canOpenWorkspace = isOwner || Boolean(membership);
  const [ownerResponse, { data: fileData }] = await Promise.all([
    isOwner
      ? supabase.from('profiles').select('*').eq('id', project.owner_id).maybeSingle()
      : supabase.from('public_profiles').select('*').eq('id', project.owner_id).maybeSingle(),
    supabase.from('project_files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
  ]);
  const ownerData = ownerResponse.data;
  const files = (fileData ?? []) as ProjectFile[];
  const signedFiles = await Promise.all(files.map(async (file) => {
    const { data } = await supabase.storage.from('project-assets').createSignedUrl(file.storage_path, 60 * 30);
    return { ...file, signedUrl: data?.signedUrl ?? null };
  }));
  const owner = ownerData as Profile | null;

  return <div className="dashboard-page project-detail-page"><Link href="/dashboard/projects" className="back-link"><ArrowLeft size={15} /> Back to repository</Link>
    <div className="project-detail-header"><div><div className="project-detail-kicker"><span>{project.category}</span><i />{project.discipline}</div><h1>{project.title}</h1><p>{project.description}</p><div className="project-detail-meta"><span><CalendarDays size={14} /> Updated {formatDate(project.updated_at)}</span><span className={`visibility-chip ${project.visibility}`}>{project.visibility === 'public' ? <Globe2 size={12} /> : <LockKeyhole size={12} />}{project.visibility}</span><span className="status-chip"><CircleDot size={13} />{formatStatus(project.status)}</span></div></div><div className="project-detail-actions">{canOpenWorkspace && <Link href={`/dashboard/projects/${project.id}/workspace`} className="button button-secondary"><Target size={15}/> Project workspace</Link>}{isOwner && <>{project.visibility === 'unlisted' && <CopyLinkButton url={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/p/${project.id}`} label="Copy share link" />}<Link href={`/dashboard/projects/${project.id}/edit`} className="button button-secondary"><Pencil size={15} /> Edit project</Link><DeleteProjectButton projectId={project.id} /></>}</div></div>
    <div className="project-detail-layout"><div className="project-detail-main">
      {project.problem_statement && <section className="detail-section"><div className="detail-section-title"><span><Target size={17} /></span><div><p className="eyebrow">THE PROBLEM</p><h2>What needed solving?</h2></div></div><p className="detail-body">{project.problem_statement}</p></section>}
      {project.objectives?.length > 0 && <section className="detail-section"><div className="detail-section-title"><span><CheckCircle2 size={17} /></span><div><p className="eyebrow">PROJECT OBJECTIVES</p><h2>What I set out to do</h2></div></div><ul className="objective-list">{project.objectives.map((objective) => <li key={objective}><CheckCircle2 size={15} />{objective}</li>)}</ul></section>}
      {project.methodology && <section className="detail-section"><div className="detail-section-title"><span><FileText size={17} /></span><div><p className="eyebrow">THE APPROACH</p><h2>Methodology</h2></div></div><p className="detail-body">{project.methodology}</p></section>}
      {project.outcomes && <section className="detail-section"><div className="detail-section-title"><span><CheckCircle2 size={17} /></span><div><p className="eyebrow">RESULTS</p><h2>Outcomes</h2></div></div><p className="detail-body">{project.outcomes}</p></section>}
      {project.lessons_learned && <section className="detail-section"><div className="detail-section-title"><span><Pencil size={17} /></span><div><p className="eyebrow">REFLECTION</p><h2>Lessons learned</h2></div></div><p className="detail-body">{project.lessons_learned}</p></section>}

      {project.external_links?.length > 0 && <section className="detail-section"><div className="detail-section-title"><span><ExternalLink size={17} /></span><div><p className="eyebrow">RELATED RESOURCES</p><h2>External links</h2></div></div><div className="external-link-list">{project.external_links.map((link) => { const safeUrl = safeExternalUrl(link); return safeUrl ? <a key={link} href={safeUrl} target="_blank" rel="noopener noreferrer">{link}<ArrowUpRight size={13} /></a> : null; })}</div></section>}
      {(!project.problem_statement && !project.objectives?.length && !project.methodology && !project.outcomes && !project.lessons_learned) && <div className="detail-empty-note">This project is taking shape. Add objectives, methodology and outcomes to make your process easier to understand.</div>}
      <section className="detail-section evidence-section"><div className="detail-section-title"><span><FileText size={17} /></span><div><p className="eyebrow">PROJECT EVIDENCE</p><h2>Files and resources</h2></div></div><ProjectAssets projectId={project.id} ownerId={project.owner_id} files={signedFiles} canManage={isOwner} /></section>
    </div><aside className="project-detail-aside"><div className="detail-aside-card"><p className="eyebrow">SKILLS DEMONSTRATED</p>{project.skills?.length ? <div className="skill-tags">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="muted-copy">Skills will appear here as you add them to this project.</p>}</div><div className="detail-aside-card"><p className="eyebrow">PROJECT OWNER</p><div className="owner-mini"><div className="owner-avatar">{owner?.full_name?.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? 'WW'}</div><div><strong>{owner?.full_name ?? 'Student'}</strong><small>{owner?.department ?? 'Student'}</small></div></div>{owner?.username && <Link className="side-card-link" href={`/u/${owner.username}`}>View portfolio <ArrowUpRight size={14} /></Link>}</div><div className="detail-aside-note"><span>NOTE</span><p>WaleWorks does not claim to certify the skills represented here. Project content is provided by its owner.</p></div></aside></div>
  </div>;
}
