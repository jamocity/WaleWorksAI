import { redirect } from 'next/navigation';
import { Check, Compass, FolderKanban, UserRound } from 'lucide-react';
import { Brand } from '@/components/brand';
import { ProfileForm } from '@/components/profile-form';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import { CAREER_PATHS, CAREER_ROLES_BY_PATH } from '@/lib/career-paths';

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ careerPath?: string; targetRole?: string }> }) {
  const params = await searchParams;
  const initialCareerPath = CAREER_PATHS.find((path) => path === params.careerPath) ?? '';
  const initialTargetRole = initialCareerPath && (CAREER_ROLES_BY_PATH[initialCareerPath] ?? []).includes(params.targetRole ?? '')
    ? params.targetRole ?? ''
    : '';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signup');
  const [{ data }, { data: privateData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('profile_private').select('contact_email').eq('profile_id', user.id).maybeSingle(),
  ]);
  if (!data) redirect('/auth/login');
  if (data.onboarding_complete) redirect('/dashboard');

  return <main className="onboarding-page"><header><Brand /><span className="onboarding-progress"><Check size={14} /> Account created <i /> Step 2 of 2</span></header><div className="onboarding-body"><div className="onboarding-intro"><p className="eyebrow">LET'S SET UP YOUR SPACE</p><h1>Give your work<br />a <span>professional home.</span></h1><p>A few details help us create your portfolio. You are in control of what is visible to others.</p><div className="onboarding-benefits"><div><UserRound /><span><b>Your profile</b><small>Introduce yourself and your interests.</small></span></div><div><FolderKanban /><span><b>Your projects</b><small>Document work as you build it.</small></span></div><div><Compass /><span><b>Your next step</b><small>Share evidence of your skills.</small></span></div></div></div><div className="onboarding-form-card"><h2>Build your student profile</h2><p>This information can be updated at any time.</p><ProfileForm profile={data as Profile} onboarding initialContactEmail={privateData?.contact_email ?? ''} initialCareerPath={initialCareerPath} initialTargetRole={initialTargetRole} /></div></div></main>;
}
