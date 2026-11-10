import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/section-heading';
import { ProjectInvitationsList } from '@/components/project-invitations-list';
import { createClient } from '@/lib/supabase/server';

type InvitationRow = { id: string; project_id: string; project_title: string; responsibility: string | null; invitation_status: 'pending' | 'accepted' | 'declined'; created_at: string };

export default async function ProjectInvitationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data, error } = await supabase.rpc('get_my_project_invitations');
  const items = (data ?? []) as InvitationRow[];

  return <div className="dashboard-page narrow-page">
    <SectionHeading eyebrow="WORK WITH OTHER STUDENTS" title="Team invitations" description="Review invitations to join student projects. You decide whether to accept or decline each one." />
    {error ? <div className="form-alert error">We couldn't load your invitations: {error.message}</div> : <ProjectInvitationsList invitations={items}/>}
  </div>;
}
