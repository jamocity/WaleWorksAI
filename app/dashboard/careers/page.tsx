import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Code2, Compass, GraduationCap, Layers3, Target, Wrench } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { createClient } from '@/lib/supabase/server';
import { CAREER_PATHS, CAREER_ROLES_BY_PATH } from '@/lib/career-paths';
import { CAREER_ROADMAPS } from '@/lib/career-roadmaps';
import { WORK_SIMULATIONS } from '@/lib/work-simulations';

export default async function CareerDiscoveryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('primary_career_path,career_interests,target_roles').eq('id', user.id).single();
  const interests = (profile?.career_interests ?? []) as string[];
  const primary = profile?.primary_career_path as string | null;
  const targetRoles = (profile?.target_roles ?? []) as string[];
  const orderedPaths = [...CAREER_PATHS].sort((a, b) => {
    const score = (path: string) => path === primary ? 0 : interests.includes(path) ? 1 : 2;
    return score(a) - score(b);
  });

  return <div className="dashboard-page career-discovery-page">
    <SectionHeading eyebrow="EXPLORE YOUR NEXT STEP" title="Career discovery" description="Explore practical career paths, build a learning plan and turn each step into portfolio evidence." action={<Link href="/dashboard/profile" className="button button-secondary">Update my interests <ArrowRight size={15} /></Link>} />
    <section className="career-discovery-hero"><div className="career-discovery-hero-icon"><Compass size={23}/></div><div><span className="eyebrow">YOUR STARTING POINT</span><h2>{primary || interests[0] || 'Explore career directions'}</h2><p>{targetRoles.length ? `You are exploring ${targetRoles.slice(0, 3).join(', ')}. Use the roadmap below to identify the skills and evidence to build next.` : 'Choose a career area that interests you. You can change your direction at any time from your profile.'}</p><div className="career-discovery-tags">{targetRoles.slice(0, 4).map((role) => <span key={role}>{role}</span>)}</div></div></section>
    <div className="career-path-list">
      {orderedPaths.map((path) => {
        const roadmap = CAREER_ROADMAPS[path];
        const roles = CAREER_ROLES_BY_PATH[path] ?? [];
        const matched = WORK_SIMULATIONS.filter((simulation) => simulation.careerTrack === path);
        const selected = path === primary || interests.includes(path);
        return <article className={`career-roadmap-card ${selected ? 'is-selected' : ''}`} key={path}>
          <div className="career-roadmap-heading"><div><span className="career-roadmap-icon"><BriefcaseBusiness size={18}/></span><div><p className="eyebrow">{selected ? 'YOUR SELECTED INTEREST' : 'CAREER AREA'}</p><h2>{path}</h2></div></div>{selected && <span className="career-selected-badge"><CheckCircle2 size={13}/> Selected</span>}</div>
          <p className="career-roadmap-summary">{roadmap.summary}</p>
          <div className="career-roadmap-grid">
            <section><h3><Target size={15}/> Roles to explore</h3><div className="career-role-pills">{roles.map((role) => <span key={role} className={targetRoles.includes(role) ? 'matched' : ''}>{role}</span>)}</div></section>
            <section><h3><Layers3 size={15}/> Core foundations</h3><ul>{roadmap.foundations.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3><Wrench size={15}/> Common tools</h3><div className="career-tool-pills">{roadmap.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></section>
            <section><h3><GraduationCap size={15}/> Learning progression</h3><ol className="career-stage-list">{roadmap.stages.map((stage, index) => <li key={stage.title}><b>{index + 1}. {stage.title}</b><p>{stage.detail}</p></li>)}</ol></section>
            <section><h3><Code2 size={15}/> Portfolio project ideas</h3><ul>{roadmap.portfolioProjects.map((project) => <li key={project}>{project}</li>)}</ul></section>
            <section><h3><BookOpen size={15}/> Workday practice</h3>{matched.length ? <div className="career-simulation-links">{matched.map((simulation) => <Link key={simulation.slug} href={`/dashboard/work-simulations/${simulation.slug}`}>{simulation.title}<ArrowRight size={13}/></Link>)}</div> : <p className="career-no-simulation">No dedicated simulation is available for this area yet. Check the full catalogue for transferable practice.</p>}</section>
          </div>
          <div className="career-roadmap-footer"><span>Suggested evidence: complete a project, document your process and add the result to your portfolio.</span><Link href={`/dashboard/projects/new?discipline=${encodeURIComponent(path)}`} className="button button-primary button-small">Start a project <ArrowRight size={14}/></Link></div>
        </article>;
      })}
    </div>
    <p className="career-discovery-note">Career roadmaps are general learning guidance, not guarantees of employment or professional certification. Requirements vary by employer and location; compare this plan with current job descriptions in your target market.</p>
  </div>;
}
