import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, Clock3, Layers3, Target } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { createClient } from '@/lib/supabase/server';
import { WORK_SIMULATIONS } from '@/lib/work-simulations';

export default async function WorkSimulationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
const { data: profile } = await supabase
  .from('profiles')
  .select('career_interests, primary_career_path, target_roles')
  .eq('id', user.id)
  .single();  const { data: attempts, error: attemptsError } = await supabase.from('work_simulation_attempts').select('simulation_slug, score, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
  const selectedPaths = (profile?.career_interests ?? []) as string[];
  const primaryPath = profile?.primary_career_path as string | null;
  const targetRoles = (profile?.target_roles ?? []) as string[];
  const sortedSimulations = [...WORK_SIMULATIONS].sort((a, b) => {
    const aRole = targetRoles.includes(a.role) ? 0 : 1;
    const bRole = targetRoles.includes(b.role) ? 0 : 1;
    const aPath = a.careerTrack === primaryPath ? 0 : selectedPaths.includes(a.careerTrack) ? 1 : 2;
    const bPath = b.careerTrack === primaryPath ? 0 : selectedPaths.includes(b.careerTrack) ? 1 : 2;
    return (aRole - bRole) || (aPath - bPath);
  });
  const latestBySlug = new Map<string, { score: number; created_at: string }>();
  for (const attempt of attempts ?? []) {
    if (!latestBySlug.has(attempt.simulation_slug)) latestBySlug.set(attempt.simulation_slug, { score: attempt.score, created_at: attempt.created_at });
  }

  return <div className="dashboard-page work-simulations-page">
    <SectionHeading eyebrow="PRACTICE THE WORK, NOT JUST THE THEORY" title="Workday simulations" description="Step into realistic technology and project-delivery situations. Make decisions, produce workplace deliverables and learn from the consequences." />
    <section className="simulation-intro-banner">
      <div className="simulation-intro-icon"><BriefcaseBusiness size={23} /></div>
      <div><span className="eyebrow">A GUIDED WORKPLACE PRACTICE LAB</span><h2>What would your workday actually look like?</h2><p>Start with a realistic brief, follow a workday timeline, handle decisions and submit a deliverable like a ticket update, pull request summary or incident handover.</p></div>
      <div className="simulation-intro-stats"><span><b>{WORK_SIMULATIONS.length}</b><small>Practice scenarios</small></span><span><b>{attempts?.length ?? 0}</b><small>Attempts saved</small></span></div>
    </section>

    {!attemptsError && attempts && attempts.length > 0 && <section className="simulation-progress-summary"><Target size={18} /><div><strong>Your practice history</strong><p>{attempts.length} submitted workday {attempts.length === 1 ? 'simulation' : 'simulations'}. Latest saved attempt: {attempts[0].score}%.</p></div></section>}
    {attemptsError && <div className="form-alert error">The simulation history table is not available yet. Run the career and simulations migration included with this update before submitting a simulation.</div>}

    <div className="simulation-list-heading"><div><p className="eyebrow">CHOOSE A ROLE TO PRACTISE</p><h2>Simulated workdays</h2></div><span>{targetRoles.length ? `Role interests: ${targetRoles.slice(0, 3).join(' · ')}` : primaryPath ? `Your main interest: ${primaryPath}` : 'Choose a career path in My Profile to personalise recommendations.'}</span></div>
    <div className="simulation-card-grid">
      {sortedSimulations.map((simulation) => {
        const isRoleMatch = targetRoles.includes(simulation.role);
        const isPrimary = simulation.careerTrack === primaryPath;
        const isSelected = selectedPaths.includes(simulation.careerTrack);
        const attempt = latestBySlug.get(simulation.slug);
        return <article className="simulation-catalog-card" key={simulation.slug}>
          <div className="simulation-card-top"><span className="simulation-role-icon"><Layers3 size={19} /></span><span className="simulation-level">{simulation.level}</span></div>
          <p className="simulation-track-label">{simulation.careerTrack}</p>
          <h3>{simulation.title}</h3>
          <p className="simulation-role-name">{simulation.role}</p>
          <p className="simulation-card-copy">{simulation.brief}</p>
          <div className="simulation-card-meta"><span><Clock3 size={13} />{simulation.duration}</span><span><Target size={13} />{simulation.questions.length} decisions + deliverable</span></div>
          {isRoleMatch ? <span className="simulation-recommendation">Matches a role you selected</span> : isPrimary ? <span className="simulation-recommendation">Recommended for your primary path</span> : isSelected ? <span className="simulation-recommendation">Matches your interests</span> : <span className="simulation-recommendation neutral">Explore another IT role</span>}
          {attempt && <div className="simulation-last-score">Latest attempt <b>{attempt.score}%</b></div>}
          <Link className="button button-primary simulation-start-button" href={`/dashboard/work-simulations/${simulation.slug}`}>Start workday <ArrowRight size={15} /></Link>
        </article>;
      })}
    </div>
    <p className="simulation-disclaimer">These are structured practice scenarios created for learning. They are not live employer work, a substitute for an actual internship, a professional certification or a human-reviewed assessment.</p>
  </div>;
}
