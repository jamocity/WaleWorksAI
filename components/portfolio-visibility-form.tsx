'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type PortfolioSettings = {
  show_academic_background: boolean;
  show_skills: boolean;
  show_achievements: boolean;
  show_certifications: boolean;
};

const defaultSettings: PortfolioSettings = {
  show_academic_background: true,
  show_skills: true,
  show_achievements: true,
  show_certifications: true,
};

export function PortfolioVisibilityForm({ profileId, initialSettings }: { profileId: string; initialSettings: Partial<PortfolioSettings> | null }) {
  const router = useRouter();
  const [settings, setSettings] = useState<PortfolioSettings>({ ...defaultSettings, ...(initialSettings ?? {}) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function setValue<K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.from('portfolio_settings').upsert({
        profile_id: profileId,
        ...settings,
      });
      if (updateError) throw updateError;
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update portfolio visibility.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="editor-card portfolio-visibility-card" onSubmit={submit}>
      <div className="privacy-settings">
        <div>
          <h3>Choose what appears on your public portfolio</h3>
          <p>These controls only affect the public portfolio. Your private workspace remains unchanged.</p>
        </div>
        <label className="toggle-row">
          <span><strong>Academic background</strong><small>University, department and academic level.</small></span>
          <input type="checkbox" checked={settings.show_academic_background} onChange={(event) => setValue('show_academic_background', event.target.checked)} />
        </label>
        <label className="toggle-row">
          <span><strong>Skills and interests</strong><small>Show the capabilities and topics you list on your profile.</small></span>
          <input type="checkbox" checked={settings.show_skills} onChange={(event) => setValue('show_skills', event.target.checked)} />
        </label>
        <label className="toggle-row">
          <span><strong>Achievements</strong><small>Show awards, recognition and milestones you have added.</small></span>
          <input type="checkbox" checked={settings.show_achievements} onChange={(event) => setValue('show_achievements', event.target.checked)} />
        </label>
        <label className="toggle-row">
          <span><strong>Certifications</strong><small>Show certificates and completed professional training.</small></span>
          <input type="checkbox" checked={settings.show_certifications} onChange={(event) => setValue('show_certifications', event.target.checked)} />
        </label>
      </div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      {saved && <div className="form-alert success" role="status">Portfolio visibility settings saved.</div>}
      <div className="form-actions"><p>You can change these settings whenever you need to.</p><button className="button button-primary" type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />} Save visibility</button></div>
    </form>
  );
}
