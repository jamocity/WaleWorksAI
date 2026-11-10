import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/section-heading';
import { HelpFeedbackForm } from '@/components/help-feedback-form';
import { createClient } from '@/lib/supabase/server';

type RequestItem = { id: string; category: string; subject: string; message: string; status: string; created_at: string };

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data, error } = await supabase.from('support_requests').select('id,category,subject,message,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(25);
  return <div className="dashboard-page help-page"><SectionHeading eyebrow="WE ARE HERE TO HELP" title="Help & feedback" description="Tell us about a problem, ask a question or suggest a way to make WaleWorks better."/><HelpFeedbackForm userId={user.id} requests={(data ?? []) as RequestItem[]} databaseReady={!error} databaseError={error?.message}/></div>;
}
