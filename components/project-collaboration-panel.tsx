'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, LoaderCircle, MessageSquare, Plus, Send, Trash2, UserPlus, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type TeamMember = {
  id: string;
  user_id: string | null;
  invited_email?: string | null;
  responsibility: string | null;
  invitation_status: string;
  created_at: string;
  display_name: string | null;
};
type TeamComment = { id: string; author_id: string; body: string; created_at: string; author_name: string | null };

export function ProjectCollaborationPanel({
  projectId, isOwner, members, comments,
}: { projectId: string; isOwner: boolean; members: TeamMember[]; comments: TeamComment[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid WaleWorks account email address.'); return; }
    setBusy('invite');
    const supabase = createClient();
    const { error: inviteError } = await supabase.rpc('send_project_invitation', {
      p_project_id: projectId,
      p_invited_email: email.trim().toLowerCase(),
      p_responsibility: responsibility.trim() || null,
    });
    if (inviteError) setError(inviteError.message);
    else { setEmail(''); setResponsibility(''); setNotice('Invitation sent inside WaleWorks. The person can accept it from Team invitations.'); router.refresh(); }
    setBusy('');
  }

  async function removeMember(member: TeamMember) {
    if (!window.confirm(member.invitation_status === 'pending' ? 'Cancel this pending invitation?' : 'Remove this teammate from the project?')) return;
    setError(''); setNotice(''); setBusy(member.id);
    const supabase = createClient();
    const { error: removeError } = await supabase.from('project_contributors').delete().eq('id', member.id);
    if (removeError) setError(removeError.message);
    else { setNotice('Project team updated.'); router.refresh(); }
    setBusy('');
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const clean = comment.trim();
    if (clean.length < 2 || clean.length > 3000) { setError('Comments must contain between 2 and 3,000 characters.'); return; }
    setBusy('comment');
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { setError('Your session has expired. Sign in again.'); setBusy(''); return; }
    const { error: insertError } = await supabase.from('project_comments').insert({ project_id: projectId, author_id: user.id, body: clean });
    if (insertError) setError(insertError.message);
    else { setComment(''); setNotice('Comment added.'); router.refresh(); }
    setBusy('');
  }

  const accepted = members.filter((member) => member.invitation_status === 'accepted');
  const pending = isOwner ? members.filter((member) => member.invitation_status === 'pending') : [];

  return <div className="project-collaboration">
    {(error || notice) && <div className={`form-alert ${error ? 'error' : 'success'}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}

    <section className="workboard-panel collab-team-panel">
      <div className="workboard-panel-heading"><span className="workboard-icon"><Users size={18}/></span><div><h2>Project team</h2><p>People who have accepted an invitation to contribute to this project.</p></div><span className="workboard-count">{accepted.length + 1} {accepted.length + 1 === 1 ? 'member' : 'members'}</span></div>
      <div className="collab-member-row collab-owner-row"><span className="collab-member-avatar">O</span><div className="collab-member-copy"><b>Project owner</b><small>Owner · full project control</small></div><span className="collab-status accepted"><Check size={12}/> Owner</span></div>
      {accepted.map((member) => <div className="collab-member-row" key={member.id}>
        <span className="collab-member-avatar">{(member.display_name || 'T').slice(0, 1).toUpperCase()}</span>
        <div className="collab-member-copy"><b>{member.display_name || 'WaleWorks teammate'}</b><small>{member.responsibility || 'Contributor'}</small></div>
        <span className="collab-status accepted"><Check size={12}/> Accepted</span>
        {isOwner && <button className="icon-button" type="button" aria-label="Remove teammate" title="Remove teammate" disabled={busy === member.id} onClick={() => void removeMember(member)}><Trash2 size={14}/></button>}
      </div>)}
      {pending.map((member) => <div className="collab-member-row" key={member.id}>
        <span className="collab-member-avatar pending">?</span>
        <div className="collab-member-copy"><b>{member.invited_email || 'Invited teammate'}</b><small>{member.responsibility || 'Invitation sent'}</small></div>
        <span className="collab-status pending">Pending</span>
        <button className="icon-button" type="button" aria-label="Cancel invitation" title="Cancel invitation" disabled={busy === member.id} onClick={() => void removeMember(member)}><Trash2 size={14}/></button>
      </div>)}
      {isOwner ? <form className="workboard-add-form collab-invite-form" onSubmit={invite}>
        <h3><UserPlus size={15}/> Invite a WaleWorks student</h3>
        <p className="muted-copy">Invitations are delivered in the recipient's WaleWorks notification inbox. The person must already have an account.</p>
        <label className="field-label">Student email<input className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="student@example.com"/></label>
        <label className="field-label">Suggested responsibility (optional)<input className="text-input" value={responsibility} onChange={(event) => setResponsibility(event.target.value)} maxLength={120} placeholder="e.g. Frontend development"/></label>
        <button className="button button-primary button-small" type="submit" disabled={busy === 'invite'}>{busy === 'invite' ? <LoaderCircle size={14} className="spin"/> : <Plus size={14}/>} Send invitation</button>
      </form> : <p className="collab-scope-note">You have joined this project as a contributor. You can record your work and take part in the team discussion.</p>}
    </section>

    <section className="workboard-panel collab-comments-panel">
      <div className="workboard-panel-heading"><span className="workboard-icon"><MessageSquare size={18}/></span><div><h2>Team discussion</h2><p>Share questions, decisions and progress with the project team.</p></div><span className="workboard-count">{comments.length} comments</span></div>
      {comments.length ? <div className="collab-comments-list">{comments.map((item) => <article className="collab-comment" key={item.id}><div className="collab-member-avatar">{(item.author_name || 'T').slice(0, 1).toUpperCase()}</div><div className="collab-comment-content"><div><b>{item.author_name || 'Team member'}</b><time>{new Date(item.created_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</time></div><p>{item.body}</p></div></article>)}</div> : <div className="workboard-empty">No team comments yet. Use the discussion to document decisions and questions.</div>}
      <form className="workboard-add-form" onSubmit={addComment}>
        <label className="field-label">Add to the discussion<textarea className="text-input textarea" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={3000} required placeholder="Write a useful project update or question..."/></label>
        <button className="button button-primary button-small" type="submit" disabled={busy === 'comment'}>{busy === 'comment' ? <LoaderCircle size={14} className="spin"/> : <Send size={14}/>} Post comment</button>
      </form>
    </section>
  </div>;
}
