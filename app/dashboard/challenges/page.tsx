import { redirect } from 'next/navigation';
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Flag, Layers3 } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ChallengeSubmissionForm } from '@/components/challenge-submission-form';
import { createClient } from '@/lib/supabase/server';

 type Challenge = { id: string; title: string; description: string; discipline: string; difficulty: string; organisation: string | null; deadline: string | null; created_at: string };
 type ProjectOption = { id: string; title: string };
 type Submission = { id: string; challenge_id: string; status: string; submitted_at: string };

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const [{ data: challengeRows, error: challengeError }, { data: projectRows }, { data: submissionRows }] = await Promise.all([
    supabase.from('challenges').select('id,title,description,discipline,difficulty,organisation,deadline,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(50),
    supabase.from('projects').select('id,title').eq('owner_id', user.id).order('updated_at', { ascending: false }).limit(100),
    supabase.from('challenge_submissions').select('id,challenge_id,status,submitted_at').eq('student_id', user.id),
  ]);
  const challenges = (challengeRows ?? []) as Challenge[];
  const projects = (projectRows ?? []) as ProjectOption[];
  const submissions = (submissionRows ?? []) as Submission[];
  const submittedIds = new Set(submissions.map((submission) => submission.challenge_id));

  return <div className="dashboard-page challenges-page">
    <SectionHeading eyebrow="PRACTICAL EXPERIENCE" title="Challenges" description="Work on structured assignments that help you practise skills and create evidence for your portfolio." />
    <section className="challenges-intro"><span><Flag size={21}/></span><div><b>Turn learning into proof of work</b><p>Browse published challenges, link a project you have built and explain your approach. Challenge submissions are practice records; they are not hiring decisions or verified work experience.</p></div></section>
    {challengeError ? <div className="form-alert error">Challenges could not be loaded. Check that the challenges table and permissions are available in Supabase. Details: {challengeError.message}</div> : challenges.length === 0 ? <div className="empty-state"><div className="empty-state-icon"><BriefcaseBusiness size={22}/></div><h3>No published challenges yet.</h3><p>New assignments will appear here when a verified mentor or administrator publishes them. In the meantime, practise with your <a href="/dashboard/work-simulations">workday simulations</a>.</p></div> : <div className="challenge-grid">{challenges.map((challenge) => {
      const submitted = submittedIds.has(challenge.id);
      const daysLeft = challenge.deadline ? Math.ceil((new Date(`${challenge.deadline}T23:59:59`).getTime() - Date.now()) / 86400000) : null;
      return <article className="challenge-card" key={challenge.id}>
        <div className="challenge-card-head"><span className="challenge-discipline"><Layers3 size={14}/>{challenge.discipline}</span><span className="challenge-difficulty">{challenge.difficulty}</span></div>
        <h2>{challenge.title}</h2>
        <p className="challenge-organisation">{challenge.organisation || 'WaleWorks community challenge'}</p>
        <p className="challenge-description">{challenge.description}</p>
        <div className="challenge-meta">{challenge.deadline && <span><CalendarDays size={14}/>{daysLeft !== null && daysLeft < 0 ? 'Deadline passed' : `Due ${new Date(`${challenge.deadline}T00:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}`}</span>}<span><BriefcaseBusiness size={14}/>Portfolio practice</span></div>
        {submitted ? <div className="challenge-submitted-banner"><CheckCircle2 size={16}/> You have submitted this challenge.</div> : challenge.deadline && daysLeft !== null && daysLeft < 0 ? <div className="challenge-expired-banner">The submission deadline has passed.</div> : <details className="challenge-submission-details"><summary>Open submission form <ArrowUpRight size={14}/></summary><ChallengeSubmissionForm challengeId={challenge.id} projects={projects} submitted={false}/></details>}
      </article>;
    })}</div>}
    {submissions.length > 0 && <section className="challenge-history"><h2>Your challenge activity</h2><p>{submissions.length} submission{submissions.length === 1 ? '' : 's'} recorded.</p></section>}
  </div>;
}
