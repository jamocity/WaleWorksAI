import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/section-heading';
import { NotificationsList } from '@/components/notifications-list';
import { createClient } from '@/lib/supabase/server';

type NotificationItem = { id: string; title: string; body: string | null; href: string | null; read_at: string | null; created_at: string };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  return <div className="dashboard-page narrow-page"><SectionHeading eyebrow="YOUR WORKSPACE ACTIVITY" title="Notifications" description="Stay informed about activity connected to your work." /><NotificationsList userId={user.id} items={(data ?? []) as NotificationItem[]} /></div>;
}
