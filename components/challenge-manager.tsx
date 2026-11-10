'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, LoaderCircle, Plus, Send, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CAREER_PATHS } from '@/lib/career-paths';

type Challenge = { id: string; title: string; description: string; discipline: string; difficulty: string; organisation: string | null; deadline: string | null; status: 'draft' | 'published' | 'closed'; created_at: string };

export function ChallengeManager({ userId, challenges }: { userId: string; challenges: Challenge[] }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState<string>(CAREER_PATHS[0]);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [organisation, setOrganisation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [publishNow, setPublishNow] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function createChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (title.trim().length < 5 || description.trim().length < 30) { setError('Use a title of at least 5 characters and a description of at least 30 characters.'); return; }
    setBusy('create');
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) { setError('Your session has expired. Sign in again.'); setBusy(''); return; }
    const { error: insertError } = await supabase.from('challenges').insert({
      created_by: user.id, title: title.trim(), description: description.trim(), discipline,
      difficulty, organisation: organisation.trim() || null, deadline: deadline || null,
      status: publishNow ? 'published' : 'draft',
    });
    if (insertError) setError(insertError.message);
    else { setTitle(''); setDescription(''); setOrganisation(''); setDeadline(''); setPublishNow(false); setNotice(publishNow ? 'Challenge published and visible to students.' : 'Draft saved. Publish it when it is ready.'); router.refresh(); }
    setBusy('');
  }

  async function changeStatus(item: Challenge, status: Challenge['status']) {
    setBusy(item.id); setError(''); setNotice('');
    const supabase = createClient();
    const { error: updateError } = await supabase.from('challenges').update({ status }).eq('id', item.id).eq('created_by', userId);
    if (updateError) setError(updateError.message); else { setNotice(`Challenge ${status === 'published' ? 'published' : status === 'closed' ? 'closed' : 'moved to draft'}.`); router.refresh(); }
    setBusy('');
  }

  async function remove(item: Challenge) {
    if (!window.confirm(`Delete “${item.title}”? Any submissions for this challenge will also be removed.`)) return;
    setBusy(item.id); setError(''); setNotice('');
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('challenges').delete().eq('id', item.id).eq('created_by', userId);
    if (deleteError) setError(deleteError.message); else { setNotice('Challenge deleted.'); router.refresh(); }
    setBusy('');
  }

  return <div className="challenge-manager">
    {(error || notice) && <div className={`form-alert ${error ? 'error' : 'success'}`}>{error || notice}</div>}
    <section className="help-form-card"><div className="help-card-heading"><span className="help-card-icon"><Plus size={18}/></span><div><h2>Create a challenge</h2><p>Give students a clear practical brief and a realistic deadline.</p></div></div>
      <form className="stacked-form" onSubmit={createChallenge}>
        <label className="field-label">Challenge title<input className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} required placeholder="e.g. Audit a sample customer-support workflow"/></label>
        <label className="field-label">Description<textarea className="text-input textarea" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} required placeholder="Describe the problem, expected deliverable, constraints and how the work should be submitted."/></label>
        <div className="form-grid"><label className="field-label">Career area<select className="text-input" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>{CAREER_PATHS.filter((item) => item !== 'Exploring IT careers').map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Difficulty<select className="text-input" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="field-label">Organisation or publisher<input className="text-input" value={organisation} onChange={(event) => setOrganisation(event.target.value)} maxLength={120} placeholder="Optional"/></label><label className="field-label">Deadline<input className="text-input" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)}/></label></div>
        <label className="challenge-publish-choice"><input type="checkbox" checked={publishNow} onChange={(event) => setPublishNow(event.target.checked)}/><span><b>Publish immediately</b><small>Students will be able to see and submit this challenge.</small></span></label>
        <button className="button button-primary" type="submit" disabled={busy === 'create'}>{busy === 'create' ? <LoaderCircle size={15} className="spin"/> : publishNow ? <Send size={15}/> : <Plus size={15}/>} {busy === 'create' ? 'Saving...' : publishNow ? 'Publish challenge' : 'Save draft'}</button>
      </form>
    </section>
    <section className="challenge-manager-list"><div className="content-section-heading"><div><p className="eyebrow">YOUR PUBLISHED WORK</p><h2>Challenges you manage</h2></div><span>{challenges.length} total</span></div>
      {challenges.length === 0 ? <div className="workboard-empty">You have not created any challenges yet.</div> : challenges.map((item) => <article key={item.id} className="challenge-manage-row"><div><b>{item.title}</b><small>{item.discipline} · {item.difficulty} · {item.status}</small></div><div className="challenge-manage-actions">{item.status !== 'published' && <button className="button button-primary button-small" type="button" onClick={() => void changeStatus(item, 'published')} disabled={busy === item.id}><Check size={13}/> Publish</button>}{item.status === 'published' && <button className="button button-secondary button-small" type="button" onClick={() => void changeStatus(item, 'closed')} disabled={busy === item.id}>Close</button>}{item.status === 'closed' && <button className="button button-secondary button-small" type="button" onClick={() => void changeStatus(item, 'draft')} disabled={busy === item.id}>Reopen as draft</button>}<button className="icon-button workboard-delete" type="button" onClick={() => void remove(item)} disabled={busy === item.id} aria-label={`Delete ${item.title}`}><Trash2 size={14}/></button></div></article>)}
    </section>
  </div>;
}
