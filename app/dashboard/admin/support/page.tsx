import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/section-heading';
import { SupportAdminInbox } from '@/components/support-admin-inbox';
import { createClient } from '@/lib/supabase/server';

type SupportRequest = { id: string; user_id: string; category: string; subject: string; message: string; status: string; created_at: string };

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');
  const { data, error } = await supabase.from('support_requests').select('id,user_id,category,subject,message,status,created_at').order('created_at', { ascending: false }).limit(100);
  return <div className="dashboard-page admin-support-page"><SectionHeading eyebrow="ADMINISTRATION" title="Support inbox" description="Review student support requests and keep their status up to date."/>{error ? <div className="form-alert error">Could not load support requests: {error.message}. Confirm the support migration has been applied.</div> : <SupportAdminInbox requests={(data ?? []) as SupportRequest[]}/>}</div>;
}
