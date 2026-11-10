'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SupportRequest = { id: string; user_id: string; category: string; subject: string; message: string; status: string; created_at: string };

export function SupportAdminInbox({ requests }: { requests: SupportRequest[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function updateStatus(id: string, status: string) {
    setBusy(id); setError(''); setNotice('');
    const supabase = createClient();
    const { error: updateError } = await supabase.from('support_requests').update({ status }).eq('id', id);
    if (updateError) setError(updateError.message); else { setNotice('Request status updated.'); router.refresh(); }
    setBusy('');
  }
  return <div className="support-admin-inbox">{(error || notice) && <div className={`form-alert ${error ? 'error' : 'success'}`}>{error || notice}</div>}{requests.length === 0 ? <div className="workboard-empty">There are no support requests yet.</div> : requests.map((item) => <article key={item.id} className="support-admin-item"><div className="support-admin-top"><div><span className="help-status">{item.category}</span><small>{new Date(item.created_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })} · User {item.user_id.slice(0, 8)}</small></div><select aria-label={`Update status for ${item.subject}`} className="text-input support-status-select" value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)} disabled={busy === item.id}><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div><h3>{item.subject}</h3><p>{item.message}</p>{busy === item.id && <small><LoaderCircle size={12} className="spin"/> Saving status...</small>}</article>)}</div>;
}
