'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';
import { slugify } from '@/lib/utils';

const disciplines = ['Software Development', 'Data & Analytics', 'Cybersecurity', 'Cloud & DevOps', 'IT Support & Infrastructure', 'QA & Software Testing', 'UI/UX & Product Design', 'AI & Machine Learning', 'Product Management & Business Analysis', 'Networking & Infrastructure', 'Other IT'];
const categories = ['Personal Project', 'Work Simulation', 'Portfolio Challenge', 'Coursework', 'Research & Innovation', 'Prototype', 'Case Study', 'Open Source Contribution', 'Technical Writing'];

function describeError(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const item = error as { message?: string; code?: string; details?: string; hint?: string };
    return [item.message, item.code ? `Code: ${item.code}` : '', item.details, item.hint].filter(Boolean).join(' · ');
  }
  return 'Could not save your project. Please try again.';
}

export function ProjectForm({ ownerId, initialProject }: { ownerId: string; initialProject?: Project }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialProject?.title ?? '');
  const [description, setDescription] = useState(initialProject?.description ?? '');
  const [problem, setProblem] = useState(initialProject?.problem_statement ?? '');
  const [objectives, setObjectives] = useState(initialProject?.objectives?.join('\n') ?? '');
  const [methodology, setMethodology] = useState(initialProject?.methodology ?? '');
  const [category, setCategory] = useState(initialProject?.category ?? 'Personal Project');
  const [discipline, setDiscipline] = useState(initialProject?.discipline ?? 'Software Development');
  const [status, setStatus] = useState(initialProject?.status ?? 'planning');
  const [visibility, setVisibility] = useState(initialProject?.visibility ?? 'private');
  const [skills, setSkills] = useState(initialProject?.skills?.join(', ') ?? '');
  const [externalLinks, setExternalLinks] = useState(initialProject?.external_links?.join('\n') ?? '');
  const [outcomes, setOutcomes] = useState(initialProject?.outcomes ?? '');
  const [lessons, setLessons] = useState(initialProject?.lessons_learned ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const disciplineOptions = initialProject && !disciplines.includes(initialProject.discipline) ? [initialProject.discipline, ...disciplines] : disciplines;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (title.trim().length < 3) { setError('Project title must contain at least 3 characters.'); return; }
    if (!description.trim()) { setError('Add a short project description before saving.'); return; }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user || user.id !== ownerId) throw new Error('Your session is missing or does not match this project. Sign in again and retry.');

      const cleanLinks = externalLinks.split('\n').map((item) => item.trim()).filter(Boolean);
      for (const link of cleanLinks) {
        let parsed: URL;
        try { parsed = new URL(link); } catch { throw new Error(`Invalid project link: ${link}`); }
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Project links must start with https:// or http://.');
      }

      const projectSlug = initialProject?.slug ?? `${(slugify(title) || 'project').slice(0, 48)}-${crypto.randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const payload = {
        owner_id: ownerId,
        title: title.trim(),
        slug: projectSlug,
        description: description.trim(),
        problem_statement: problem.trim() || null,
        objectives: objectives.split('\n').map((item) => item.trim()).filter(Boolean),
        methodology: methodology.trim() || null,
        category,
        discipline,
        status,
        visibility,
        skills: skills.split(',').map((item) => item.trim()).filter(Boolean),
        external_links: cleanLinks,
        outcomes: outcomes.trim() || null,
        lessons_learned: lessons.trim() || null,
      };

      let projectId = initialProject?.id;
      if (initialProject) {
        const { data, error: updateError } = await supabase.from('projects').update(payload)
          .eq('id', initialProject.id).eq('owner_id', ownerId).select('id').single();
        if (updateError) throw updateError;
        if (!data?.id) throw new Error('No project was updated. Check that you own this project and that the Supabase update policy is enabled.');
        projectId = data.id;
      } else {
        const { data, error: insertError } = await supabase.from('projects').insert(payload).select('id').single();
        if (insertError) throw insertError;
        if (!data?.id) throw new Error('Supabase did not return a new project ID. The project may not have been created.');
        projectId = data.id;
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (caught) {
      setError(describeError(caught));
      setLoading(false);
    }
  }

  return (
    <form className="stacked-form project-editor" onSubmit={submit} noValidate>
      <div className="form-section-title"><span>01</span><div><h2>Project overview</h2><p>Give your work a clear identity and help people understand its value.</p></div></div>
      <div className="form-grid">
        <label className="field-label field-span-2">Project title <em>Required</em><input className="text-input" required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Customer support ticket dashboard" /></label>
        <label className="field-label field-span-2">Short description <em>Required</em><textarea className="text-input textarea" required rows={3} maxLength={3000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What did you build, investigate or improve? Who is it useful for?" /></label>
        <label className="field-label">IT career area<select className="text-input" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>{disciplineOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field-label">Project type<select className="text-input" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      <div className="form-section-title"><span>02</span><div><h2>Thinking behind the work</h2><p>Show the problem, your approach and the decisions you made.</p></div></div>
      <div className="form-grid">
        <label className="field-label field-span-2">Problem being solved<textarea className="text-input textarea" rows={3} value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="What need, gap or challenge motivated this project?" /></label>
        <label className="field-label field-span-2">Objectives <small>One objective per line</small><textarea className="text-input textarea" rows={3} value={objectives} onChange={(event) => setObjectives(event.target.value)} placeholder={'Understand the user problem\nDesign and test a practical solution\nMeasure the result'} /></label>
        <label className="field-label field-span-2">Methodology and approach<textarea className="text-input textarea" rows={4} value={methodology} onChange={(event) => setMethodology(event.target.value)} placeholder="Describe the tools, methods, research or process you used." /></label>
      </div>

      <div className="form-section-title"><span>03</span><div><h2>Evidence and outcomes</h2><p>Capture the skills you practised and what the work produced.</p></div></div>
      <div className="form-grid">
        <label className="field-label field-span-2">Skills demonstrated <small>Separate skills with commas</small><input className="text-input" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Troubleshooting, SQL, testing, communication" /></label>
        <label className="field-label field-span-2">Outcomes<textarea className="text-input textarea" rows={3} value={outcomes} onChange={(event) => setOutcomes(event.target.value)} placeholder="What changed, worked or was delivered? Leave blank while work is ongoing." /></label>
        <label className="field-label field-span-2">Lessons learned<textarea className="text-input textarea" rows={3} value={lessons} onChange={(event) => setLessons(event.target.value)} placeholder="What did you learn? What would you improve next time?" /></label>
        <label className="field-label field-span-2">External links <small>One URL per line — live demos, repositories, articles, datasets or videos</small><textarea className="text-input textarea" rows={2} value={externalLinks} onChange={(event) => setExternalLinks(event.target.value)} placeholder={'https://github.com/yourname/project\nhttps://example.com/project-demo'} /></label>
      </div>

      <div className="form-section-title"><span>04</span><div><h2>Progress and visibility</h2><p>You can keep updating this project as it develops.</p></div></div>
      <div className="form-grid">
        <label className="field-label">Current status<select className="text-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="planning">Planning</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
        <label className="field-label">Who can see this?<select className="text-input" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}><option value="private">Private — only me</option><option value="public">Public — shown on my portfolio</option><option value="unlisted">Unlisted — hidden from your portfolio, shared by link</option></select></label>
      </div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <div className="form-actions"><p>Only describe work you actually completed. Unlisted links are not passwords; keep confidential information private.</p><button className="button button-primary" type="submit" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin" /> : <Save size={17} />}{loading ? 'Saving project...' : initialProject ? 'Save changes' : 'Create project'}</button></div>
    </form>
  );
}
