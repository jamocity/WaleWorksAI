'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type RequestItem = { id: string; category: string; subject: string; message: string; status: string; created_at: string };

export function HelpFeedbackForm({ userId, requests, databaseReady, databaseError }: { userId: string; requests: RequestItem[]; databaseReady: boolean; databaseError?: string | null }) {
  const router = useRouter();
  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setSuccess('');
    if (subject.trim().length < 4) { setError('Use a subject of at least 4 characters.'); return; }
    if (message.trim().length < 20) { setError('Please provide at least 20 characters so we can understand your request.'); return; }
    setBusy(true);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) { setError('Your session has expired. Sign in again.'); setBusy(false); return; }
    const { error: insertError } = await supabase.from('support_requests').insert({
      user_id: user.id, category, subject: subject.trim(), message: message.trim(), status: 'open',
    });
    if (insertError) { setError(insertError.message); setBusy(false); return; }
    setSubject(''); setMessage(''); setSuccess('Your request has been submitted. You can see it in your request history below.'); setBusy(false); router.refresh();
  }

  return <div className="help-feedback-layout">
    <section className="help-form-card"><div className="help-card-heading"><span className="help-card-icon"><Send size={18}/></span><div><h2>Send us a message</h2><p>Report a problem, ask for help or suggest an improvement.</p></div></div>
      {!databaseReady ? <div className="form-alert error">{databaseError?.includes('PGRST205') || databaseError?.includes('42P01') ? 'The support inbox is not configured yet. Apply supabase/migrations/20261110_support_requests.sql in your Supabase SQL Editor, then refresh this page.' : `The support inbox could not be loaded: ${databaseError || 'Unknown database error'}`}</div> : <form className="stacked-form" onSubmit={submit}>
        <label className="field-label">What is this about?<select className="text-input" value={category} onChange={(event) => setCategory(event.target.value)}><option value="bug">Report a bug</option><option value="account">Account or profile help</option><option value="project">Project or portfolio help</option><option value="simulation">Workday simulation help</option><option value="idea">Feature suggestion</option><option value="other">Something else</option></select></label>
        <label className="field-label">Subject<input className="text-input" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required placeholder="A short description of the issue"/></label>
        <label className="field-label">Message<textarea className="text-input textarea" rows={6} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} required placeholder="Tell us what happened, what you expected and the steps to reproduce it. Do not include passwords, private keys or sensitive personal information."/><small>{message.length}/4000 characters</small></label>
        {error && <div className="form-alert error" role="alert">{error}</div>}{success && <div className="form-alert success" role="status">{success}</div>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin"/> : <Send size={16}/>} {busy ? 'Sending...' : 'Submit request'}</button>
      </form>}
    </section>
    <section className="help-request-card"><div className="help-card-heading"><span className="help-card-icon"><span className="help-history-dot"/></span><div><h2>Your requests</h2><p>Messages submitted from this account.</p></div></div>
      {!databaseReady ? <p className="muted-copy">Request history will appear after the support inbox is configured.</p> : requests.length === 0 ? <div className="help-empty-history">You have not submitted a support request yet.</div> : <div className="help-request-list">{requests.map((request) => <article key={request.id}><div><b>{request.subject}</b><span className={`help-status ${request.status}`}>{request.status.replaceAll('_', ' ')}</span></div><small>{request.category.replaceAll('_', ' ')} · {new Date(request.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</small><p>{request.message}</p></article>)}</div>}
      <div className="help-security-note">Never include your password, verification codes, API keys or confidential project data in a support request.</div>
    </section>
  </div>;
}
