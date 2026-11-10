'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ProjectOption = { id: string; title: string };

export function ChallengeSubmissionForm({ challengeId, projects, submitted }: { challengeId: string; projects: ProjectOption[]; submitted: boolean }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(submitted);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (note.trim().length < 30) { setError('Add at least 30 characters explaining your approach or the work you plan to submit.'); return; }
    setBusy(true);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { setError('Your session has expired. Sign in again.'); setBusy(false); return; }
    const { error: insertError } = await supabase.from('challenge_submissions').insert({
      challenge_id: challengeId,
      student_id: user.id,
      project_id: projectId || null,
      submission_note: note.trim(),
      status: 'submitted',
    });
    if (insertError) {
      setError(insertError.code === '23505' ? 'You have already submitted this challenge.' : insertError.message);
      setBusy(false);
      return;
    }
    setSuccess(true);
    setBusy(false);
    router.refresh();
  }

  if (success) return <div className="challenge-submitted-state"><CheckCircle2 size={17}/><span>Submission recorded. You can review its status in your challenge list.</span></div>;
  return <form className="challenge-submit-form" onSubmit={submit}>
    {projects.length > 0 && <label className="field-label">Link an existing project (optional)<select className="text-input" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">No project linked</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>}
    <label className="field-label">Your approach or submission note<textarea className="text-input textarea" rows={3} maxLength={2500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain how you would approach this challenge, what you have completed and what evidence you are providing." required/></label>
    {error && <div className="form-alert error" role="alert">{error}</div>}
    <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={15} className="spin"/> : <Send size={15}/>} {busy ? 'Submitting...' : 'Submit challenge'}</button>
  </form>;
}
