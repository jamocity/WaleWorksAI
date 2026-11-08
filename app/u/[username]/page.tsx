import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, BriefcaseBusiness, Globe2, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { Brand } from '@/components/brand';
import { Avatar } from '@/components/avatar';
import { ProjectCard } from '@/components/project-card';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project } from '@/lib/types';

export default async function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('public_profiles').select('*').eq('username', username).maybeSingle();
  if (!data) notFound();
  const profile = data as Profile & { contact_email: string | null };
  const [{ data: projectData }, { data: settingsData }] = await Promise.all([
    supabase.from('projects').select('*').eq('owner_id', profile.id).eq('visibility', 'public').order('featured', { ascending: false }).order('updated_at', { ascending: false }),
    supabase.from('portfolio_settings').select('*').eq('profile_id', profile.id).maybeSingle(),
  ]);
  const projects = (projectData ?? []) as Project[];
  const settings = settingsData ?? { show_academic_background: true, show_skills: true, show_achievements: true, show_certifications: true, custom_intro: null };
  return <main className="public-portfolio-page"><header className="public-portfolio-header"><Brand /><span><Globe2 size={14} /> PUBLIC PORTFOLIO</span><Link href="/auth/signup" className="button button-secondary button-small">Build yours <ArrowUpRight size={14} /></Link></header><section className="public-profile-hero"><div className="public-profile-banner" /><div className="public-profile-main"><Avatar name={profile.full_name} image={profile.avatar_url} size="lg" /><div className="public-profile-identity"><span className="public-verified-label"><span /> WALEWORKS STUDENT PORTFOLIO</span><h1>{profile.full_name}</h1><p>{profile.department || 'Student'}{profile.university ? ` · ${profile.university}` : ''}</p><div className="public-profile-meta">{profile.academic_level && <span><GraduationCap size={14} /> {profile.academic_level}</span>}{profile.location && <span><MapPin size={14} /> {profile.location}</span>}<span><BriefcaseBusiness size={14} /> {projects.length} public project{projects.length === 1 ? '' : 's'}</span></div></div><div className="public-contact-actions">{profile.show_email && profile.contact_email && <a className="button button-primary" href={`mailto:${profile.contact_email}`}>Contact {profile.full_name.split(' ')[0]} <ArrowUpRight size={15} /></a>}</div></div></section><div className="public-portfolio-content"><section className="public-about"><div className="public-section-title"><p className="eyebrow">ABOUT</p><h2>A little about me</h2></div><p>{settings.custom_intro || profile.bio || 'This student is building their professional story. Check back as more project work is documented.'}</p>{settings.show_academic_background && <div className="public-academic-row"><GraduationCap size={17} /><div><strong>{profile.university || 'University not listed'}</strong><small>{profile.department || 'Department not listed'}{profile.academic_level ? ` · ${profile.academic_level}` : ''}</small></div></div>}</section>
  <section className="public-projects-section"><div className="public-section-heading"><div><p className="eyebrow">SELECTED WORK</p><h2>Projects and practical work</h2><p>Explore the projects, process and outcomes I have chosen to share.</p></div><span>{projects.length} PROJECTS</span></div>{projects.length ? <div className="project-grid public-project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} href={`/p/${project.id}`} />)}</div> : <div className="public-empty-projects"><Sparkles size={20} /><p>Projects will appear here as they are shared publicly.</p></div>}</section>
  {settings.show_skills && (profile.skills.length > 0 || profile.interests.length > 0) && <section className="public-skills-section"><div><p className="eyebrow">CAPABILITIES</p><h2>Skills and interests</h2></div><div className="skill-tags">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}{profile.interests.map((interest) => <span className="interest-tag" key={interest}>{interest}</span>)}</div></section>}
  {settings.show_achievements && profile.achievements.length > 0 && <section className="public-skills-section"><div><p className="eyebrow">RECOGNITION</p><h2>Achievements</h2></div><ul className="objective-list">{profile.achievements.map((item) => <li key={item}>{item}</li>)}</ul></section>}
  {settings.show_certifications && profile.certifications.length > 0 && <section className="public-skills-section"><div><p className="eyebrow">LEARNING RECORD</p><h2>Certifications</h2></div><ul className="objective-list">{profile.certifications.map((item) => <li key={item}>{item}</li>)}</ul></section>}
  <section className="portfolio-footnote"><span>W</span><p>This portfolio is maintained by its owner on WaleWorks AI. Project details are self-reported and do not represent professional certification.</p></section></div><footer className="public-portfolio-footer"><Brand /><span>Beyond CVs. Show What You Can Build.</span><Link href="/auth/signup">Create your WaleWorks portfolio <ArrowUpRight size={14} /></Link></footer></main>;
}
