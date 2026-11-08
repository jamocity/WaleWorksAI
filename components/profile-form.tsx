'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Camera, LoaderCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { slugify } from '@/lib/utils';

export function ProfileForm({ profile, onboarding = false, initialContactEmail = '' }: { profile: Profile; onboarding?: boolean; initialContactEmail?: string }) {
  const router = useRouter();
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
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [showEmail, setShowEmail] = useState(profile.show_email);
  const [professionalVisibility, setProfessionalVisibility] = useState(profile.professional_visibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function uploadAvatar(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use a JPG, PNG or WEBP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Profile images must be 5 MB or smaller.'); return; }
    setAvatarUploading(true); setError('');
    try {
      const supabase = createClient();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${profile.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not upload your profile image.'); }
    finally { setAvatarUploading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const cleanUsername = slugify(username).slice(0, 30);
      if (cleanUsername.length < 3) throw new Error('Your public username must be at least 3 characters.');
      const { error: updateError } = await supabase.from('profiles').update({
        full_name: fullName.trim(),
        username: cleanUsername,
        university: university.trim() || null,
        department: department.trim() || null,
        academic_level: level || null,
        bio: bio.trim() || null,
        interests: interests.split(',').map((item) => item.trim()).filter(Boolean),
        skills: skills.split(',').map((item) => item.trim()).filter(Boolean),
        achievements: achievements.split('\n').map((item) => item.trim()).filter(Boolean),
        certifications: certifications.split('\n').map((item) => item.trim()).filter(Boolean),
        location: location.trim() || null,
        avatar_url: avatarUrl || null,
        is_public: isPublic,
        show_email: showEmail,
        professional_visibility: professionalVisibility,
        onboarding_complete: true,
      }).eq('id', profile.id);
      if (updateError) throw updateError;
      const { error: privateError } = await supabase.from('profile_private').upsert({ profile_id: profile.id, contact_email: contactEmail.trim() || null });
      if (privateError) throw privateError;
      router.push(onboarding ? '/dashboard' : isPublic ? `/u/${cleanUsername}` : '/dashboard/profile');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="stacked-form">
      <div className="avatar-upload-row"><div className="avatar-upload-preview">{avatarUrl ? <Image src={avatarUrl} alt="Profile preview" width={55} height={55} unoptimized /> : <span>{fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'WW'}</span>}</div><div><strong>Profile picture</strong><small>JPG, PNG or WEBP · up to 5 MB</small><label className="button button-secondary button-small avatar-upload-button"><Camera size={14} />{avatarUploading ? 'Uploading...' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={avatarUploading} onChange={(event) => uploadAvatar(event.target.files?.[0])} /></label></div></div>
      <div className="form-grid">
        <label className="field-label">Full name <em>Required</em><input className="text-input" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your professional name" /></label>
        <label className="field-label">Portfolio username <em>Required</em><div className="username-input"><span>/u/</span><input value={username} required minLength={3} maxLength={30} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} /></div></label>
        <label className="field-label">University<input className="text-input" value={university} onChange={(event) => setUniversity(event.target.value)} placeholder="Wale University" /></label>
        <label className="field-label">Department / Faculty<input className="text-input" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="e.g. Computer Science" /></label>
        <label className="field-label">Academic level<select className="text-input" value={level} onChange={(event) => setLevel(event.target.value)}><option value="">Select level</option>{['100 Level','200 Level','300 Level','400 Level','500 Level','Postgraduate','Graduate','Other'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label">Location<input className="text-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, Country" /></label>
        <label className="field-label field-span-2">Professional contact email<input className="text-input" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="name@example.com" /><small>Separate from your sign-in email. It is shown only when the public email toggle is enabled.</small></label>
        <label className="field-label field-span-2">Professional introduction<textarea className="text-input textarea" rows={4} maxLength={1200} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="What are you interested in? What kinds of problems do you want to solve?" /></label>
        <label className="field-label field-span-2">Areas of interest <small>Separate with commas</small><input className="text-input" value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="Product design, public health, renewable energy" /></label>
        <label className="field-label field-span-2">Skills <small>Separate with commas</small><input className="text-input" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Research, teamwork, Excel, writing" /></label>
        <label className="field-label field-span-2">Achievements <small>One achievement per line</small><textarea className="text-input textarea" rows={2} value={achievements} onChange={(event) => setAchievements(event.target.value)} placeholder={'Innovation competition finalist\nDepartmental project award'} /></label>
        <label className="field-label field-span-2">Certifications <small>One certification per line</small><textarea className="text-input textarea" rows={2} value={certifications} onChange={(event) => setCertifications(event.target.value)} placeholder={'Google Data Analytics Certificate\nFirst Aid Training'} /></label>
      </div>
      <div className="privacy-settings">
        <div><h3>Portfolio visibility</h3><p>Choose what visitors and potential employers can discover.</p></div>
        <label className="toggle-row"><span><strong>Public profile</strong><small>Allow anyone with your link to view your public portfolio.</small></span><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Professional discovery</strong><small>Allow your public profile to appear in future employer searches.</small></span><input type="checkbox" checked={professionalVisibility} onChange={(event) => setProfessionalVisibility(event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Show email on portfolio</strong><small>Display your professional contact email on your public portfolio. Off by default.</small></span><input type="checkbox" checked={showEmail} onChange={(event) => setShowEmail(event.target.checked)} /></label>
      </div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <div className="form-actions"><p>{onboarding ? 'You can refine every detail later.' : 'Your portfolio updates as soon as you save.'}</p><button className="button button-primary" type="submit" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin" /> : onboarding ? <ArrowRight size={17} /> : <Save size={17} />}{onboarding ? 'Finish profile' : 'Save profile'}</button></div>
    </form>
  );
}
