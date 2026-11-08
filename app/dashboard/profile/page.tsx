import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { PortfolioVisibilityForm } from '@/components/portfolio-visibility-form';
import { ProfileForm } from '@/components/profile-form';
import { SectionHeading } from '@/components/section-heading';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data }, { data: privateData }, { data: settingsData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profile_private').select('contact_email').eq('profile_id', user.id).maybeSingle(),
    supabase.from('portfolio_settings')
      .select('show_academic_background,show_skills,show_achievements,show_certifications')
      .eq('profile_id', user.id)
      .maybeSingle(),
  ]);

  const profile = data as Profile;

  return (
    <div className="dashboard-page narrow-page">
      <SectionHeading
        eyebrow="YOUR PROFESSIONAL IDENTITY"
        title="My profile"
        description="Your introduction, academic context and the skills you are developing."
        action={profile.is_public ? (
          <Link href={`/u/${profile.username}`} target="_blank" rel="noreferrer" className="button button-secondary">
            View portfolio <ExternalLink size={15} />
          </Link>
        ) : undefined}
      />

      <div className="profile-editor-intro">
        <Avatar name={profile.full_name} image={profile.avatar_url} size="lg" />
        <div>
          <strong>{profile.full_name}</strong>
          <span>{profile.department || 'Add your department'} · {profile.university || 'Add your university'}</span>
          {profile.is_public ? (
            <Link href={`/u/${profile.username}`} target="_blank" rel="noreferrer">
              /u/{profile.username} <ArrowUpRight size={13} />
            </Link>
          ) : (
            <span>/u/{profile.username} · private</span>
          )}
        </div>
        <span className={`profile-visibility-pill ${profile.is_public ? 'visible' : ''}`}>
          {profile.is_public ? 'Public profile' : 'Private profile'}
        </span>
      </div>

      <div className="editor-card">
        <ProfileForm profile={profile} initialContactEmail={privateData?.contact_email ?? ''} />
      </div>

      <SectionHeading
        eyebrow="PORTFOLIO PRIVACY"
        title="Public section visibility"
        description="Choose which parts of your profile appear on the portfolio link you share."
      />
      <PortfolioVisibilityForm profileId={profile.id} initialSettings={settingsData} />
    </div>
  );
}
