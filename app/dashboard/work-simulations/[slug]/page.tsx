import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { WorkSimulationRunner } from '@/components/work-simulation-runner';
import { createClient } from '@/lib/supabase/server';
import { getWorkSimulation } from '@/lib/work-simulations';

export default async function WorkSimulationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const simulation = getWorkSimulation(slug);
  if (!simulation) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return <div className="dashboard-page simulation-detail-page">
    <Link href="/dashboard/work-simulations" className="back-link"><ArrowLeft size={15} /> All workday simulations</Link>
    <div className="simulation-detail-hero"><div><p className="eyebrow">{simulation.careerTrack.toUpperCase()} · {simulation.level.toUpperCase()}</p><h1>{simulation.title}</h1><p>{simulation.objective}</p><div className="simulation-detail-meta"><span><BriefcaseBusiness size={14} />{simulation.role}</span><span><Clock3 size={14} />{simulation.duration}</span></div></div></div>
    <div className="simulation-detail-layout">
      <div className="simulation-detail-main">
        <section className="simulation-review-card"><p className="eyebrow">YOUR WORKPLACE CONTEXT</p><h2>Where you work</h2><p>{simulation.workplace}</p><div className="simulation-workplace-brief"><MapPin size={17} /><div><strong>Today's situation</strong><p>{simulation.brief}</p></div></div></section>
        <section className="simulation-review-card"><p className="eyebrow">YOUR WORKDAY TIMELINE</p><h2>How the day unfolds</h2><div className="simulation-timeline">{simulation.dayPlan.map((item) => <div className="simulation-timeline-item" key={item.time}><time>{item.time}</time><span className="simulation-timeline-dot" /><p>{item.activity}</p></div>)}</div></section>
        <section className="simulation-review-card"><p className="eyebrow">YOUR TASK</p><h2>Make the decisions and deliver the work</h2><p>Choose the response you would take in each situation, then submit the written workplace deliverable. Feedback explains the recommended approach.</p></section>
        <WorkSimulationRunner simulation={simulation} />
      </div>
      <aside className="simulation-detail-aside"><div className="simulation-aside-card"><span className="eyebrow">WHAT YOU WILL PRACTISE</span><h3>Skills in context</h3><ul>{simulation.objective.split(', ').map((item) => <li key={item}>{item}</li>)}</ul><span className="simulation-aside-rule">Your decisions and written response are saved to your account.</span></div><div className="simulation-aside-card simulation-safety-card"><strong>Practice environment</strong><p>Use fictional data only. Never enter real passwords, customer records, confidential workplace information or personal data.</p></div></aside>
    </div>
  </div>;
}
