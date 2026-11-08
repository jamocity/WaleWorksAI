import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  return <div className="dashboard-page narrow-page"><SectionHeading eyebrow="ACCOUNT PREFERENCES" title="Settings" description="Manage your account and the visibility of your work." /><div className="settings-list"><Link href="/dashboard/profile" className="settings-row"><span className="settings-icon"><UserRound size={18} /></span><span><strong>Profile and portfolio</strong><small>Change your name, academic details, public link and visibility settings.</small></span><ArrowRight size={17} /></Link><div className="settings-row static"><span className="settings-icon"><KeyRound size={18} /></span><span><strong>Sign-in email</strong><small>{user.email ?? 'No email available'} · Password and email changes are managed through Supabase Auth.</small></span></div><div className="settings-row static"><span className="settings-icon"><ShieldCheck size={18} /></span><span><strong>Privacy and data</strong><small>Private projects are not displayed on your public portfolio. Employers cannot access private project files.</small></span></div></div><div className="settings-note"><b>Security note</b><p>Never share your password or private project links with people you do not trust. WaleWorks support will never ask for your password.</p></div></div>;
}
