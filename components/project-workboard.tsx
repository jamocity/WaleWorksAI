'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Check, Circle, Flag, LoaderCircle, Plus, Trash2, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Milestone = { id: string; title: string; description: string | null; due_date: string | null; completed_at: string | null; position: number; created_at: string };
type Contribution = { id: string; contribution_type: string; title: string; details: string | null; evidence_url: string | null; created_at: string };

export function ProjectWorkboard({ projectId, userId, milestones, contributions }: { projectId: string; userId: string; milestones: Milestone[]; contributions: Contribution[] }) {
  const router = useRouter();
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contributionType, setContributionType] = useState('implementation');
  const [contributionTitle, setContributionTitle] = useState('');
  const [contributionDetails, setContributionDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function addMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (milestoneTitle.trim().length < 3) { setError('Milestone title must contain at least 3 characters.'); return; }
    setBusy('milestone');
    const supabase = createClient();
    const { error: insertError } = await supabase.from('project_milestones').insert({
      project_id: projectId, title: milestoneTitle.trim(), description: milestoneDescription.trim() || null,
      due_date: dueDate || null, position: milestones.length,
    });
    if (insertError) setError(insertError.message);
    else { setMilestoneTitle(''); setMilestoneDescription(''); setDueDate(''); setNotice('Milestone added.'); router.refresh(); }
    setBusy('');
  }

  async function toggleMilestone(milestone: Milestone) {
    setError(''); setNotice(''); setBusy(milestone.id);
    const supabase = createClient();
    const { error: updateError } = await supabase.from('project_milestones').update({ completed_at: milestone.completed_at ? null : new Date().toISOString() }).eq('id', milestone.id).eq('project_id', projectId);
    if (updateError) setError(updateError.message); else { setNotice('Milestone updated.'); router.refresh(); }
    setBusy('');
  }

  async function deleteMilestone(id: string) {
    setError(''); setNotice(''); setBusy(id);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('project_milestones').delete().eq('id', id).eq('project_id', projectId);
    if (deleteError) setError(deleteError.message); else { setNotice('Milestone removed.'); router.refresh(); }
    setBusy('');
  }

  async function addContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (contributionTitle.trim().length < 3 || contributionDetails.trim().length < 10) { setError('Add a clear title and at least 10 characters describing the work.'); return; }
    let cleanEvidence: string | null = null;
    if (evidenceUrl.trim()) {
      try { const parsed = new URL(evidenceUrl.trim()); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); cleanEvidence = parsed.toString(); }
      catch { setError('Evidence links must be valid HTTP or HTTPS URLs.'); return; }
    }
    setBusy('contribution');
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) { setError('Your session has expired. Sign in again.'); setBusy(''); return; }
    const { error: insertError } = await supabase.from('contributions').insert({
      project_id: projectId, user_id: user.id, contribution_type: contributionType,
      title: contributionTitle.trim(), details: contributionDetails.trim(), evidence_url: cleanEvidence,
    });
    if (insertError) setError(insertError.message);
    else { setContributionTitle(''); setContributionDetails(''); setEvidenceUrl(''); setNotice('Contribution recorded.'); router.refresh(); }
    setBusy('');
  }

  const completedCount = milestones.filter((item) => item.completed_at).length;
  return <div className="project-workboard">
    {(error || notice) && <div className={`form-alert ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}
    <section className="workboard-panel">
      <div className="workboard-panel-heading"><span className="workboard-icon"><Flag size={18}/></span><div><h2>Project milestones</h2><p>Break the project into steps and track what is finished.</p></div><span className="workboard-count">{completedCount}/{milestones.length} complete</span></div>
      {milestones.length > 0 ? <div className="workboard-milestone-list">{milestones.map((milestone) => <article className={`workboard-milestone ${milestone.completed_at ? 'complete' : ''}`} key={milestone.id}>
        <button type="button" className="milestone-check" onClick={() => void toggleMilestone(milestone)} disabled={busy === milestone.id} aria-label={milestone.completed_at ? 'Mark milestone incomplete' : 'Mark milestone complete'}>{busy === milestone.id ? <LoaderCircle size={16} className="spin"/> : milestone.completed_at ? <Check size={16}/> : <Circle size={16}/>}</button>
        <div className="milestone-content"><b>{milestone.title}</b>{milestone.description && <p>{milestone.description}</p>}{milestone.due_date && <small><CalendarDays size={12}/>{new Date(`${milestone.due_date}T00:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</small>}</div>
        <button type="button" className="icon-button workboard-delete" onClick={() => void deleteMilestone(milestone.id)} disabled={busy === milestone.id} aria-label={`Delete milestone ${milestone.title}`}><Trash2 size={14}/></button>
      </article>)}</div> : <div className="workboard-empty">No milestones yet. Add a few small steps to make the next action clear.</div>}
      <form className="workboard-add-form" onSubmit={addMilestone}><h3><Plus size={15}/> Add a milestone</h3><label className="field-label">Milestone title<input className="text-input" value={milestoneTitle} onChange={(event) => setMilestoneTitle(event.target.value)} maxLength={120} required placeholder="e.g. Complete user research"/></label><label className="field-label">Description (optional)<textarea className="text-input textarea" rows={2} value={milestoneDescription} onChange={(event) => setMilestoneDescription(event.target.value)} maxLength={1000} placeholder="What needs to be done?"/></label><label className="field-label">Target date (optional)<input className="text-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)}/></label><button className="button button-primary button-small" type="submit" disabled={busy === 'milestone'}>{busy === 'milestone' ? <LoaderCircle size={14} className="spin"/> : <Plus size={14}/>} Add milestone</button></form>
    </section>
    <section className="workboard-panel">
      <div className="workboard-panel-heading"><span className="workboard-icon"><Wrench size={18}/></span><div><h2>Contribution log</h2><p>Keep a dated record of the work you personally completed.</p></div><span className="workboard-count">{contributions.length} entries</span></div>
      {contributions.length > 0 ? <div className="workboard-contribution-list">{contributions.map((item) => <article key={item.id}><div className="contribution-type-label">{item.contribution_type.replaceAll('_', ' ')}</div><b>{item.title}</b>{item.details && <p>{item.details}</p>}<div className="contribution-meta"><time>{new Date(item.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</time>{item.evidence_url && <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">View evidence</a>}</div></article>)}</div> : <div className="workboard-empty">No contribution entries yet. Record research, design, implementation, testing or documentation as you complete it.</div>}
      <form className="workboard-add-form" onSubmit={addContribution}><h3><Plus size={15}/> Record completed work</h3><label className="field-label">Type of contribution<select className="text-input" value={contributionType} onChange={(event) => setContributionType(event.target.value)}><option value="planning">Planning</option><option value="research">Research</option><option value="design">Design</option><option value="implementation">Implementation</option><option value="testing">Testing</option><option value="documentation">Documentation</option><option value="other">Other</option></select></label><label className="field-label">What did you do?<input className="text-input" value={contributionTitle} onChange={(event) => setContributionTitle(event.target.value)} maxLength={120} required placeholder="e.g. Implemented the login form"/></label><label className="field-label">Details<textarea className="text-input textarea" rows={3} value={contributionDetails} onChange={(event) => setContributionDetails(event.target.value)} maxLength={2000} required placeholder="Describe the work you completed and the result."/></label><label className="field-label">Evidence link (optional)<input className="text-input" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://..."/></label><button className="button button-primary button-small" type="submit" disabled={busy === 'contribution'}>{busy === 'contribution' ? <LoaderCircle size={14} className="spin"/> : <Plus size={14}/>} Save contribution</button></form>
    </section>
    <p className="workboard-scope-note">This workboard tracks the project owner's milestones and contribution history. Team invitations and invitee acceptance will be enabled after a verified, consent-based invitation workflow is added.</p>
  </div>;
}
