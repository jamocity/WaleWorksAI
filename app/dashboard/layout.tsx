import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile) redirect('/onboarding');
  if (!profile.onboarding_complete) redirect('/onboarding');
  return <AppShell profile={profile as Profile}>{children}</AppShell>;
}
