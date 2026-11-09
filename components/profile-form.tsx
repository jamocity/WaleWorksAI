'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Camera, LoaderCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { CAREER_PATHS, CAREER_ROLES_BY_PATH, CAREER_STAGES } from '@/lib/career-paths';

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const item = error as { message?: string; code?: string; details?: string; hint?: string };
    return [item.message, item.code ? `Code: ${item.code}` : '', item.details, item.hint].filter(Boolean).join(' · ');
  }
  return 'Could not save your profile. Please try again.';
}

export function ProfileForm({ profile, onboarding = false, initialContactEmail = '' }: { profile: Profile; onboarding?: boolean; initialContactEmail?: string }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [username, setUsername] = useState(profile.username ?? '');
  const [university, setUniversity] = useState(profile.university ?? 'Wale University');
  const [department, setDepartment] = useState(profile.department ?? '');
  const [level, setLevel] = useState(profile.academic_level ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [interests, setInterests] = useState(profile.interests?.join(', ') ?? '');
  const [skills, setSkills] = useState(profile.skills?.join(', ') ?? '');
  const [achievements, setAchievements] = useState(profile.achievements?.join('\n') ?? '');
  const [certifications, setCertifications] = useState(profile.certifications?.join('\n') ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState('');
  const [careerInterests, setCareerInterests] = useState<string[]>(profile.career_interests ?? []);
  const [primaryCareerPath, setPrimaryCareerPath] = useState(profile.primary_career_path ?? '');
  const [careerStage, setCareerStage] = useState(profile.career_stage ?? 'exploring');
  const [targetRoles, setTargetRoles] = useState<string[]>(profile.target_roles ?? []);
  const router = useRouter();
  const [careerGoal, setCareerGoal] = useState(profile.career_goal ?? '');
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [showEmail, setShowEmail] = useState(profile.show_email);
  const [professionalVisibility, setProfessionalVisibility] = useState(profile.professional_visibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleCareerPath(path: string) {
    const next = careerInterests.includes(path)
      ? careerInterests.filter((item) => item !== path)
      : [...careerInterests, path];
    setCareerInterests(next);
    if (!next.includes(path)) {
      const rolesForRemovedPath = CAREER_ROLES_BY_PATH[path] ?? [];
      setTargetRoles((current) => current.filter((role) => !rolesForRemovedPath.includes(role)));
    }
    if (primaryCareerPath === path && !next.includes(path)) setPrimaryCareerPath(next[0] ?? '');
    else if (!primaryCareerPath && next.length) setPrimaryCareerPath(next[0]);
  }

  function toggleTargetRole(role: string) {
    setTargetRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    setError('');
    setAvatarNotice('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile images must be 5 MB or smaller.');
      return;
    }

    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user || user.id !== profile.id) throw new Error('Your session has expired. Sign in again before uploading a profile photo.');

      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${profile.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      if (!data.publicUrl) {
        await supabase.storage.from('avatars').remove([path]);
        throw new Error('The image uploaded, but Supabase did not return a public image URL. Check that the avatars bucket is public.');
      }
      const publicUrl = new URL(data.publicUrl);
      publicUrl.searchParams.set('v', String(Date.now()));

      // Persist the avatar as soon as upload succeeds. This prevents an uploaded image
      // from being lost when a student navigates away before submitting the full form.
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.toString() })
        .eq('id', profile.id)
        .select('id')
        .single();
      if (profileError || !updatedProfile) {
        await supabase.storage.from('avatars').remove([path]);
        throw profileError ?? new Error('The image uploaded but the profile record was not updated. Check the profiles update policy.');
      }

      setAvatarUrl(publicUrl.toString());
      setAvatarNotice('Photo uploaded and saved to your profile.');
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (avatarUploading) {
      setError('Please wait for your profile photo to finish uploading before saving.');
      return;
    }
    const cleanUsername = slugify(username).slice(0, 30);
    if (cleanUsername.length < 3) {
      setError('Your public username must be at least 3 characters.');
      return;
    }
    if (onboarding && !primaryCareerPath) {
      setError('Choose the IT career path that interests you most. You can change it later.');
      return;
    }
    if (onboarding && targetRoles.length === 0) {
      setError('Choose at least one specific IT role you would like to explore. This helps us tailor your workday practice.');
      return;
    }
    if (primaryCareerPath && !careerInterests.includes(primaryCareerPath)) {
      setError('Your primary career path must also be selected in your career interests.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user || user.id !== profile.id) throw new Error('Your session has expired. Sign in again and retry.');

      const { data: savedProfile, error: updateError } = await supabase.from('profiles').update({
        full_name: fullName.trim(),
        username: cleanUsername,
        university: university.trim() || null,
        department: department.trim() || null,
        academic_level: level || null,
        bio: bio.trim() || null,
        interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
        skills: skills.split(',').map((item) => item.trim()).filter(Boolean),
        achievements: splitLines(achievements),
        certifications: splitLines(certifications),
        location: location.trim() || null,
        avatar_url: avatarUrl || null,
        career_interests: careerInterests,
        primary_career_path: primaryCareerPath || null,
        career_stage: careerStage,
        career_goal: careerGoal.trim() || null,
        target_roles: targetRoles,
        is_public: isPublic,
        show_email: showEmail,
        professional_visibility: professionalVisibility,
        onboarding_complete: true,
      }).eq('id', profile.id).select('id, avatar_url, username').single();
      if (updateError) throw updateError;
      if (!savedProfile) throw new Error('Your profile was not updated. Check that the profile row exists and your Supabase profile update policy is enabled.');

      const { error: privateError } = await supabase.from('profile_private').upsert({
        profile_id: profile.id,
        contact_email: contactEmail.trim() || null,
      }, { onConflict: 'profile_id' });
      if (privateError) throw privateError;

      const destination = onboarding ? '/dashboard' : isPublic ? `/u/${cleanUsername}` : '/dashboard/profile';
      router.replace(destination);
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="stacked-form">
      <div className="avatar-upload-row">
        <div className="avatar-upload-preview">
          {avatarUrl ? <Image key={avatarUrl} src={avatarUrl} alt="Profile preview" width={55} height={55} unoptimized /> : <span>{fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'WW'}</span>}
        </div>
        <div>
          <strong>Profile picture</strong>
          <small>JPG, PNG or WEBP · up to 5 MB</small>
          <label className="button button-secondary button-small avatar-upload-button">
            <Camera size={14} />{avatarUploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={avatarUploading || loading} onChange={(event) => { void uploadAvatar(event.target.files?.[0]); event.currentTarget.value = ''; }} />
          </label>
          {avatarNotice && <small className="avatar-upload-notice" role="status">{avatarNotice}</small>}
        </div>
      </div>

      <section className="career-preferences-section">
        <div className="form-section-title"><span>01</span><div><h2>Your IT career direction</h2><p>Choose the areas you want to explore. WaleWorks will use this to tailor practice, project prompts and dashboard recommendations.</p></div></div>
        <div className="career-path-grid">
          {CAREER_PATHS.map((path) => (
            <label className={`career-path-option ${careerInterests.includes(path) ? 'selected' : ''}`} key={path}>
              <input type="checkbox" checked={careerInterests.includes(path)} onChange={() => toggleCareerPath(path)} />
              <span>{path}</span>
            </label>
          ))}
        </div>
        <div className="form-grid career-meta-grid">
          <label className="field-label">Primary career interest <em>{onboarding ? 'Required' : 'Recommended'}</em>
            <select className="text-input" value={primaryCareerPath} onChange={(event) => {
              const next = event.target.value;
              setPrimaryCareerPath(next);
              if (next && !careerInterests.includes(next)) setCareerInterests((current) => [...current, next]);
            }}>
              <option value="">Choose your main direction</option>
              {CAREER_PATHS.filter((path) => careerInterests.includes(path)).map((path) => <option key={path} value={path}>{path}</option>)}
            </select>
          </label>
          <label className="field-label">Where are you in your journey?
            <select className="text-input" value={careerStage} onChange={(event) => setCareerStage(event.target.value)}>
              {CAREER_STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
            </select>
          </label>
          <label className="field-label field-span-2">What role or outcome are you working towards? <small>Optional</small>
            <input className="text-input" value={careerGoal} onChange={(event) => setCareerGoal(event.target.value)} placeholder="e.g. Become a frontend developer and secure an internship" />
          </label>
        </div>
        <div className="target-role-section">
          <div className="target-role-heading">
            <strong>Which specific IT roles would you like to try?</strong>
            <small>Select one or more. You can explore other roles later.</small>
          </div>
          {careerInterests.length === 0 ? (
            <p className="target-role-empty">Choose one or more career areas above to see relevant job roles.</p>
          ) : (
            CAREER_PATHS.filter((path) => careerInterests.includes(path)).map((path) => (
              <div className="target-role-group" key={path}>
                <span>{path}</span>
                <div className="target-role-grid">
                  {(CAREER_ROLES_BY_PATH[path] ?? []).map((role) => (
                    <label className={`target-role-option ${targetRoles.includes(role) ? 'selected' : ''}`} key={role}>
                      <input type="checkbox" checked={targetRoles.includes(role)} onChange={() => toggleTargetRole(role)} />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="form-grid">
        <label className="field-label">Full name <em>Required</em><input className="text-input" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your professional name" /></label>
        <label className="field-label">Portfolio username <em>Required</em><div className="username-input"><span>/u/</span><input value={username} required minLength={3} maxLength={30} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} /></div></label>
        <label className="field-label">University<input className="text-input" value={university} onChange={(event) => setUniversity(event.target.value)} placeholder="Wale University" /></label>
        <label className="field-label">Department / Faculty<input className="text-input" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="e.g. Computer Science" /></label>
        <label className="field-label">Academic level<select className="text-input" value={level} onChange={(event) => setLevel(event.target.value)}><option value="">Select level</option>{['100 Level','200 Level','300 Level','400 Level','500 Level','Postgraduate','Graduate','Other'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label">Location<input className="text-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, Country" /></label>
        <label className="field-label field-span-2">Professional contact email<input className="text-input" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="name@example.com" /><small>Separate from your sign-in email. It is shown only when the public email toggle is enabled.</small></label>
        <label className="field-label field-span-2">Professional introduction<textarea className="text-input textarea" rows={4} maxLength={1200} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What are you interested in? What kinds of problems do you want to solve?" /></label>
        <label className="field-label field-span-2">Other areas of interest <small>Separate with commas</small><input className="text-input" value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="Open-source, accessibility, fintech" /></label>
        <label className="field-label field-span-2">Skills <small>Separate with commas</small><input className="text-input" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="JavaScript, SQL, communication, troubleshooting" /></label>
        <label className="field-label field-span-2">Achievements <small>One achievement per line</small><textarea className="text-input textarea" rows={2} value={achievements} onChange={(event) => setAchievements(event.target.value)} placeholder={'Hackathon finalist\nDepartmental project award'} /></label>
        <label className="field-label field-span-2">Certifications <small>One certification per line</small><textarea className="text-input textarea" rows={2} value={certifications} onChange={(event) => setCertifications(event.target.value)} placeholder={'Google Data Analytics Certificate\nAWS Cloud Practitioner'} /></label>
      </div>

      <div className="privacy-settings">
        <div><h3>Portfolio visibility</h3><p>Choose what visitors and potential employers can discover.</p></div>
        <label className="toggle-row"><span><strong>Public profile</strong><small>Allow anyone with your link to view your public portfolio.</small></span><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Professional discovery</strong><small>Allow your public profile to appear in future employer searches.</small></span><input type="checkbox" checked={professionalVisibility} onChange={(event) => setProfessionalVisibility(event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Show email on portfolio</strong><small>Display your professional contact email on your public portfolio. Off by default.</small></span><input type="checkbox" checked={showEmail} onChange={(event) => setShowEmail(event.target.checked)} /></label>
      </div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <div className="form-actions"><p>{onboarding ? 'Your career direction shapes the simulations and project prompts we recommend. You can change it later.' : 'Your career preferences and portfolio update when you save.'}</p><button className="button button-primary" type="submit" disabled={loading || avatarUploading}>{loading ? <LoaderCircle size={17} className="spin" /> : onboarding ? <ArrowRight size={17} /> : <Save size={17} />}{avatarUploading ? 'Uploading photo...' : loading ? 'Saving...' : onboarding ? 'Finish profile' : 'Save profile'}</button></div>
    </form>
  );
}
