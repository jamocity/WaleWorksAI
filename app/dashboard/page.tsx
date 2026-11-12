import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight, ArrowUpRight, BookOpenCheck, BriefcaseBusiness, CheckCircle2, CircleHelp,
  Compass, FilePlus2, FolderKanban, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectCard } from '@/components/project-card';
import { CopyLinkButton } from '@/components/copy-link-button';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project } from '@/lib/types';
import { WORK_SIMULATIONS } from '@/lib/work-simulations';

function completion(profile: Profile) {
  const checks = [!!profile.full_name, !!profile.university, !!profile.department, !!profile.academic_level, !!profile.bio, profile.skills.length > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const [{ data: profileData }, { data: projectData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('projects').select('*').eq('owner_id', user.id).order('updated_at', { ascending: false }),
  ]);
  const profile = profileData as Profile;
  const projects = (projectData ?? []) as Project[];
  const complete = completion(profile);
  const completedProjects = projects.filter((project) => project.status === 'completed').length;
  const publicProjects = projects.filter((project) => project.visibility === 'public').length;
  const targetRoles = profile.target_roles ?? [];
  const recommendedSimulation = WORK_SIMULATIONS.find((item) => targetRoles.includes(item.role))
    ?? WORK_SIMULATIONS.find((item) => item.careerTrack === profile.primary_career_path)
    ?? WORK_SIMULATIONS.find((item) => (profile.career_interests ?? []).includes(item.careerTrack))
    ?? WORK_SIMULATIONS[0];
  const uniqueSkills = new Set([...profile.skills, ...projects.flatMap((project) => project.skills ?? [])]);

  return <div className="dashboard-page">
    <div className="dashboard-welcome-row"><SectionHeading eyebrow="STUDENT WORKSPACE" title={`Welcome back, ${profile.full_name.split(' ')[0] || 'there'}.`} description="Your progress, projects and professional story — all in one place." /><div className="welcome-date"><span className="welcome-date-dot" /> YOUR WORKSPACE IS READY</div></div>
    <div className="dashboard-quick-actions"><Link href="/dashboard/projects/new" className="button button-primary"><FilePlus2 size={16} /> New project</Link><Link href="/dashboard/profile" className="button button-secondary">Edit profile <ArrowUpRight size={15} /></Link></div>

    <section className="stat-grid">
      <article className="stat-card"><div className="stat-icon navy"><FolderKanban size={18} /></div><span className="stat-label">TOTAL PROJECTS</span><strong>{projects.length}</strong><small>{completedProjects} completed · {projects.length - completedProjects} in progress or planning</small></article>
      <article className="stat-card"><div className="stat-icon blue"><Target size={18} /></div><span className="stat-label">SKILLS DOCUMENTED</span><strong>{uniqueSkills.size}</strong><small>Connected to your profile and projects</small></article>
      <article className="stat-card"><div className="stat-icon violet"><Compass size={18} /></div><span className="stat-label">PUBLIC PROJECTS</span><strong>{publicProjects}</strong><small>Visible on your portfolio</small></article>
      <article className="stat-card"><div className="stat-icon green"><TrendingUp size={18} /></div><span className="stat-label">PROFILE COMPLETION</span><strong>{complete}%</strong><small>{complete === 100 ? 'Your profile is complete' : 'A stronger profile builds trust'}</small></article>
    </section>

    <div className="dashboard-columns">
      <section className="dashboard-main-column">
        <div className="content-section-heading"><div><p className="eyebrow">YOUR WORK, IN MOTION</p><h2>Recent projects</h2></div><Link href="/dashboard/projects">View all projects <ArrowRight size={15} /></Link></div>
        {projects.length ? <div className="project-grid dashboard-project-grid">{projects.slice(0, 4).map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <div className="empty-state"><div className="empty-state-icon"><FolderKanban size={22} /></div><h3>Your first project starts here.</h3><p>Document a class project, research task, prototype, business case or anything that demonstrates how you solve problems.</p><Link href="/dashboard/projects/new" className="button button-primary">Create your first project <ArrowRight size={16} /></Link><div className="example-note"><span>EXAMPLE</span> A project could be “A low-cost irrigation solution for small farms”.</div></div>}
        <div className="content-section-heading challenge-heading"><div><p className="eyebrow">PRACTISE A REAL WORKDAY</p><h2>Workday simulations</h2></div><Link href="/dashboard/work-simulations">Explore all simulations <ArrowRight size={15} /></Link></div>
        <Link href={`/dashboard/work-simulations/${recommendedSimulation.slug}`} className="dashboard-simulation-feature"><span className="dashboard-simulation-icon"><BriefcaseBusiness size={20} /></span><div><small>{recommendedSimulation.role} · {recommendedSimulation.duration}</small><h3>{recommendedSimulation.title}</h3><p>{recommendedSimulation.brief}</p><strong>Start this workday <ArrowRight size={14} /></strong></div></Link><div className="content-section-heading collaboration-heading"><div><p className="eyebrow">PLAN AND DOCUMENT YOUR WORK</p><h2>Project workboards</h2></div><span className="coming-soon-label">PHASE 2</span></div><div className="coming-module"><div className="coming-module-icon"><FolderKanban size={20} /></div><div><h3>Make your project progress visible.</h3><p>Set milestones and record the work you personally complete in a project workboard. Team invitations are not enabled yet.</p></div>{projects[0] ? <Link className="module-status module-action" href={`/dashboard/projects/${projects[0].id}/workspace`}>Open workboard <ArrowRight size={13}/></Link> : <Link className="module-status module-action" href="/dashboard/projects/new">Create a project <ArrowRight size={13}/></Link>}</div>
      </section>

      <aside className="dashboard-side-column">
        <section className="side-card career-direction-card"><div className="side-card-heading"><div><p className="eyebrow">YOUR CAREER DIRECTION</p><h3>{profile.primary_career_path || 'Choose your IT path'}</h3></div><span className="career-direction-icon"><Target size={17} /></span></div><p>{profile.career_goal || 'Your selected interests help tailor workday simulations, project prompts and skill-building recommendations.'}</p>{targetRoles.length > 0 && <><small className="career-role-label">ROLES YOU WANT TO EXPLORE</small><div className="career-chip-list">{targetRoles.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div></>}<div className="career-chip-list">{(profile.career_interests ?? []).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><Link className="side-card-link" href="/dashboard/careers">Explore career roadmaps <ArrowRight size={14} /></Link><Link className="side-card-link" href="/dashboard/profile">Update career preferences <ArrowRight size={14} /></Link></section>
        <section className="side-card profile-progress-card"><div className="side-card-heading"><div><p className="eyebrow">YOUR PRESENCE</p><h3>Profile strength</h3></div><span className="completion-number">{complete}%</span></div><div className="large-progress-track"><span style={{ width: `${complete}%` }} /></div><p className="progress-help">A complete profile helps people understand your direction and experience.</p><div className="profile-check-list">{[
          ['Add your university', !!profile.university], ['Choose your department', !!profile.department], ['Write your introduction', !!profile.bio], ['Add skills', profile.skills.length > 0],
        ].map(([label, done]) => <div key={String(label)} className={done ? 'is-done' : ''}><span>{done ? <CheckCircle2 size={15} /> : <i />}</span>{label}</div>)}</div><Link className="side-card-link" href="/dashboard/profile">Improve your profile <ArrowRight size={14} /></Link></section>
        <section className="side-card portfolio-card"><div className="portfolio-card-top"><span><BookOpenCheck size={18} /></span><small>YOUR PUBLIC PORTFOLIO</small></div><h3>Your work, ready to share.</h3><p>Give employers, mentors and collaborators one clear place to explore your projects.</p><div className="portfolio-url"><span>/u/{profile.username}</span></div><CopyLinkButton url={`/u/${profile.username}`} label="Copy portfolio link" isPublic={profile.is_public} />{profile.is_public ? <Link className="portfolio-preview-link" href={`/u/${profile.username}`} target="_blank" rel="noreferrer">Preview your portfolio <ArrowUpRight size={14} /></Link> : <><p className="portfolio-private-note">Your profile is private. You can copy the link now, but visitors cannot see it until you enable public visibility.</p><Link href="/dashboard/profile" className="button button-secondary portfolio-visibility-button">Manage visibility <ArrowRight size={14} /></Link></>}</section>
        <section className="side-card ai-card" id="ai-assistant"><div className="ai-card-icon"><Sparkles size={17} /></div><div><span className="coming-soon-label">AVAILABLE INSIDE PROJECT WORKSPACES</span><h3>AI Project Assistant</h3><p>Get help reviewing project documentation, identifying evidence-backed skills and planning your next steps. AI responses are suggestions, not verified assessments.</p><Link href={projects[0] ? `/dashboard/projects/${projects[0].id}/workspace` : "/dashboard/projects"}>Open project assistant <ArrowRight size={14} /></Link></div></section>
        <div className="dashboard-tip"><CircleHelp size={16} /><p><b>Remember:</b> Keep private work private. Only projects you mark public appear on your portfolio.</p></div>
      </aside>
    </div>
  </div>;
}
