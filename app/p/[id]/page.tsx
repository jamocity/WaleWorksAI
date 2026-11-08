import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, ExternalLink, FileText, Globe2, Target } from 'lucide-react';
import { Brand } from '@/components/brand';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, ProjectFile } from '@/lib/types';
import { formatDate, formatStatus, safeExternalUrl } from '@/lib/utils';

export default async function PublicProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('projects').select('*').eq('id', id).in('visibility', ['public', 'unlisted']).maybeSingle();
  if (!data) notFound();
  const project = data as Project;
  const [{ data: profileData }, { data: fileData }] = await Promise.all([
    supabase.from('public_profiles').select('*').eq('id', project.owner_id).maybeSingle(),
    supabase.from('project_files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
  ]);
  const profile = profileData as Profile | null;
  const files = (fileData ?? []) as ProjectFile[];
  const signedFiles = await Promise.all(files.map(async (file) => {
    const { data: signed } = await supabase.storage.from('project-assets').createSignedUrl(file.storage_path, 60 * 20);
    return { file, url: signed?.signedUrl };
  }));
  return <main className="public-project-page"><header className="public-portfolio-header"><Brand />{profile ? <Link href={`/u/${profile.username}`} className="back-link"><ArrowLeft size={15} /> Back to {profile.full_name}'s portfolio</Link> : <span className="back-link">Shared by a WaleWorks student</span>}<span><Globe2 size={14} /> SHARED PROJECT</span></header><article className="public-project-wrap"><div className="project-detail-kicker"><span>{project.category}</span><i />{project.discipline}<i />{formatStatus(project.status)}</div><h1>{project.title}</h1><p className="public-project-summary">{project.description}</p><div className="public-project-owner"><div className="owner-avatar">{profile ? profile.full_name.split(' ').map((part) => part[0]).slice(0, 2).join('') : 'WW'}</div><span><strong>{profile?.full_name ?? 'WaleWorks student'}</strong><small>{profile?.department ?? 'Student'} · Updated {formatDate(project.updated_at)}</small></span></div>
  {project.problem_statement && <section className="detail-section"><div className="detail-section-title"><span><Target size={17} /></span><div><p className="eyebrow">THE PROBLEM</p><h2>What needed solving?</h2></div></div><p className="detail-body">{project.problem_statement}</p></section>}
  {project.objectives.length > 0 && <section className="detail-section"><div className="detail-section-title"><span><CheckCircle2 size={17} /></span><div><p className="eyebrow">OBJECTIVES</p><h2>What the project set out to do</h2></div></div><ul className="objective-list">{project.objectives.map((item) => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></section>}
  {project.methodology && <section className="detail-section"><div className="detail-section-title"><span><FileText size={17} /></span><div><p className="eyebrow">APPROACH</p><h2>Methodology</h2></div></div><p className="detail-body">{project.methodology}</p></section>}
  {project.outcomes && <section className="detail-section"><div className="detail-section-title"><span><CheckCircle2 size={17} /></span><div><p className="eyebrow">RESULTS</p><h2>Outcomes</h2></div></div><p className="detail-body">{project.outcomes}</p></section>}
  {project.lessons_learned && <section className="detail-section"><div className="detail-section-title"><span><CalendarDays size={17} /></span><div><p className="eyebrow">REFLECTION</p><h2>Lessons learned</h2></div></div><p className="detail-body">{project.lessons_learned}</p></section>}

  {project.external_links?.length > 0 && <section className="detail-section"><div className="detail-section-title"><span><ExternalLink size={17} /></span><div><p className="eyebrow">RELATED RESOURCES</p><h2>External links</h2></div></div><div className="external-link-list">{project.external_links.map((link) => { const safeUrl = safeExternalUrl(link); return safeUrl ? <a key={link} href={safeUrl} target="_blank" rel="noopener noreferrer">{link}<ArrowUpRight size={13} /></a> : null; })}</div></section>}
  {project.skills.length > 0 && <section className="detail-section"><p className="eyebrow">SKILLS DEMONSTRATED</p><div className="skill-tags">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
  {signedFiles.length > 0 && <section className="detail-section"><p className="eyebrow">PROJECT EVIDENCE</p><div className="asset-list public-asset-list">{signedFiles.map(({ file, url }) => <div className="asset-row" key={file.id}><span className="asset-icon"><FileText size={17} /></span><div className="asset-copy">{url ? <a href={url} target="_blank" rel="noreferrer">{file.file_name}</a> : <span>{file.file_name}</span>}<small>Shared project file</small></div></div>)}</div></section>}
  <div className="public-project-disclaimer">Project information is supplied by the student. Skills and outcomes are not independently certified by WaleWorks AI.</div></article><footer className="public-portfolio-footer"><Brand /><span>Beyond CVs. Show What You Can Build.</span>{profile ? <Link href={`/u/${profile.username}`}>View portfolio <ArrowLeft className="rotate-icon" size={14} /></Link> : <span>Project shared publicly</span>}</footer></main>;
}
