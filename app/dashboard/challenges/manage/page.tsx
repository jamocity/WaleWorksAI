import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/section-heading';
import { ChallengeManager } from '@/components/challenge-manager';
import { createClient } from '@/lib/supabase/server';

type Challenge = { id: string; title: string; description: string; discipline: string; difficulty: string; organisation: string | null; deadline: string | null; status: 'draft' | 'published' | 'closed'; created_at: string };

export default async function ManageChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['mentor', 'admin'].includes(profile.role)) redirect('/dashboard/challenges');
  const { data, error } = await supabase.from('challenges').select('id,title,description,discipline,difficulty,organisation,deadline,status,created_at').eq('created_by', user.id).order('created_at', { ascending: false });
  return <div className="dashboard-page challenge-manage-page"><SectionHeading eyebrow="MENTOR WORKSPACE" title="Manage challenges" description="Create practical briefs, publish assignments and close submissions when their deadline passes."/>{error ? <div className="form-alert error">Could not load your challenges: {error.message}</div> : <ChallengeManager userId={user.id} challenges={(data ?? []) as Challenge[]}/>}</div>;
}
