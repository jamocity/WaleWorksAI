'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Clock3, FolderKanban, LoaderCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Invitation = {
  id: string;
  project_id: string;
  project_title: string;
  responsibility: string | null;
  invitation_status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

export function ProjectInvitationsList({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function respond(id: string, response: 'accepted' | 'declined') {
    setBusyId(id); setError(''); setNotice('');
    const supabase = createClient();
    const { error: actionError } = await supabase.rpc('respond_to_project_invitation', {
      p_invitation_id: id,
      p_response: response,
    });
    if (actionError) setError(actionError.message);
    else {
      setNotice(response === 'accepted' ? 'Invitation accepted. You are now a project teammate.' : 'Invitation declined.');
      router.refresh();
    }
    setBusyId('');
  }

  if (!invitations.length) return <div className="empty-state"><div className="empty-state-icon"><FolderKanban size={22}/></div><h3>No team invitations yet</h3><p>When a project owner invites you to collaborate, you can review it here.</p></div>;

  return <div className="collab-invitations-list">
    {(error || notice) && <div className={`form-alert ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}
    {invitations.map((item) => <article className="collab-invitation-card" key={item.id}>
      <div className="collab-invitation-icon"><FolderKanban size={19}/></div>
      <div className="collab-invitation-copy">
        <span className="eyebrow">{item.invitation_status === 'pending' ? 'PENDING INVITATION' : 'ACCEPTED TEAM INVITATION'}</span>
        <h3>{item.project_title || 'Project invitation'}</h3>
        {item.responsibility && <p>Suggested responsibility: {item.responsibility}</p>}
        <small><Clock3 size={12}/> {new Date(item.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
      </div>
      {item.invitation_status === 'pending' ? <div className="collab-invitation-actions">
        <button className="button button-primary button-small" type="button" disabled={busyId === item.id} onClick={() => void respond(item.id, 'accepted')}>{busyId === item.id ? <LoaderCircle size={14} className="spin"/> : <Check size={14}/>} Accept</button>
        <button className="button button-secondary button-small" type="button" disabled={busyId === item.id} onClick={() => void respond(item.id, 'declined')}><X size={14}/> Decline</button>
      </div> : <Link className="button button-secondary button-small" href={`/dashboard/projects/${item.project_id}/workspace`}>Open workspace</Link>}
    </article>)}
  </div>;
}
