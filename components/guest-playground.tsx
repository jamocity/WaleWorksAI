'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, CheckCircle2,
  Code2, Compass, FolderKanban, LockKeyhole, RotateCcw, Sparkles,
  Target, Trophy, Wrench,
} from 'lucide-react';
import { Brand } from '@/components/brand';
import { CAREER_PATHS, CAREER_ROLES_BY_PATH } from '@/lib/career-paths';
import { CAREER_ROADMAPS } from '@/lib/career-roadmaps';
import { WORK_SIMULATIONS, type WorkSimulation } from '@/lib/work-simulations';
import { GUEST_WORKDAY_FALLBACKS, type GuestWorkdayScenario } from '@/lib/guest-workdays';

type PlaygroundTab = 'career' | 'workday' | 'portfolio';

type GuestSimulation = Pick<WorkSimulation, 'title' | 'role' | 'duration' | 'brief' | 'questions' | 'careerTrack'> | GuestWorkdayScenario;

function getGuestSimulation(careerPath: string, targetRole: string): GuestSimulation | null {
  if (!careerPath) return null;
  const simulation = WORK_SIMULATIONS.find((item) => item.careerTrack === careerPath) ?? GUEST_WORKDAY_FALLBACKS[careerPath];
  if (!simulation) return null;
  return { ...simulation, role: targetRole || simulation.role, questions: simulation.questions.slice(0, 3) };
}

function buildSignupHref(careerPath: string, targetRole: string) {
  const params = new URLSearchParams({ source: 'guest-playground' });
  if (careerPath) params.set('careerPath', careerPath);
  if (targetRole) params.set('targetRole', targetRole);
  return `/auth/signup?${params.toString()}`;
}

export function GuestPlayground() {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('career');
  const [careerPath, setCareerPath] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [workdayComplete, setWorkdayComplete] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Student Project Tracker');
  const [projectProblem, setProjectProblem] = useState('Students need a simple way to record projects, skills and progress in one place.');
  const [projectSkills, setProjectSkills] = useState('Research, problem solving, communication');
  const [showProjectPreview, setShowProjectPreview] = useState(false);

  const roles = careerPath ? (CAREER_ROLES_BY_PATH[careerPath] ?? []) : [];
  const roadmap = careerPath ? CAREER_ROADMAPS[careerPath] : undefined;
  const demoSimulation = useMemo(() => getGuestSimulation(careerPath, targetRole), [careerPath, targetRole]);
  const question = demoSimulation?.questions[questionIndex];
  const score = useMemo(
    () => demoSimulation?.questions.filter((item) => answers[item.id] === item.correctOptionId).length ?? 0,
    [answers, demoSimulation],
  );
  const signupHref = buildSignupHref(careerPath, targetRole);

  function chooseCareerPath(nextPath: string) {
    setCareerPath(nextPath);
    setTargetRole(CAREER_ROLES_BY_PATH[nextPath]?.[0] ?? '');
    resetWorkday();
  }

  function chooseTargetRole(nextRole: string) {
    setTargetRole(nextRole);
    resetWorkday();
  }

  function checkAnswer() {
    if (!question || !selectedAnswer) return;
    setAnswers((current) => ({ ...current, [question.id]: selectedAnswer }));
    setShowFeedback(true);
  }

  function advanceWorkday() {
    if (!showFeedback || !demoSimulation) return;
    if (questionIndex >= demoSimulation.questions.length - 1) {
      setWorkdayComplete(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer('');
    setShowFeedback(false);
  }

  function resetWorkday() {
    setQuestionIndex(0);
    setSelectedAnswer('');
    setAnswers({});
    setShowFeedback(false);
    setWorkdayComplete(false);
  }

  const projectSkillList = projectSkills.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8);

  return (
    <main className="guest-playground-page">
      <header className="guest-playground-header">
        <Brand />
        <div className="guest-header-actions">
          <span className="guest-mode-label"><LockKeyhole size={13} /> Guest preview</span>
          <Link href="/auth/login" className="guest-sign-in">Sign in</Link>
          <Link href="/auth/signup" className="button button-primary button-small">Create account <ArrowUpRight size={14} /></Link>
        </div>
      </header>

      <section className="guest-playground-hero">
        <div className="guest-hero-orb guest-hero-orb-one" />
        <div className="guest-hero-orb guest-hero-orb-two" />
        <div className="guest-hero-copy">
          <span className="guest-eyebrow"><span /> NO SIGN-UP REQUIRED TO TRY</span>
          <h1>See what your work<br />could <span>become.</span></h1>
          <p>Explore a career direction, make workplace decisions and shape a project preview. Take a look around before creating an account.</p>
          <div className="guest-hero-points"><span><CheckCircle2 size={15} /> Try it in minutes</span><span><CheckCircle2 size={15} /> No payment details</span><span><CheckCircle2 size={15} /> No account needed</span></div>
        </div>
        <div className="guest-hero-card">
          <div className="guest-hero-card-top"><span><Sparkles size={15} /> YOUR WaleWorks PREVIEW</span><span className="guest-live-dot">INTERACTIVE</span></div>
          <div className="guest-preview-stat-row"><div><small>CAREER DIRECTIONS</small><b>{CAREER_PATHS.length}</b></div><div><small>WORKDAY PRACTICE</small><b>{CAREER_PATHS.length}</b></div><div><small>YOUR FIRST STEP</small><b>Now</b></div></div>
          <div className="guest-preview-flow"><span className="guest-flow-icon"><Compass size={17} /></span><div><b>Find a direction</b><small>Explore roles and learning steps.</small></div><ArrowRight size={15} /></div>
          <div className="guest-preview-flow"><span className="guest-flow-icon"><BriefcaseBusiness size={17} /></span><div><b>Try the work</b><small>Make decisions in a sample workday.</small></div><ArrowRight size={15} /></div>
          <div className="guest-preview-flow"><span className="guest-flow-icon"><FolderKanban size={17} /></span><div><b>Preview your evidence</b><small>See how a project can appear in a portfolio.</small></div><ArrowRight size={15} /></div>
        </div>
      </section>

      <section className="guest-playground-main" aria-label="Interactive WaleWorks preview">
        <div className="guest-playground-heading">
          <div><p className="eyebrow">THE INTERACTIVE PREVIEW</p><h2>Choose what you want to try</h2><p>Move between the tools whenever you like. Your guest activity stays in this browser session and is not saved to an account.</p></div>
          <span className="guest-session-pill"><LockKeyhole size={13} /> Private guest session</span>
        </div>

        <div className="guest-tab-list" role="tablist" aria-label="Guest preview tools">
          <button type="button" role="tab" aria-selected={activeTab === 'career'} className={activeTab === 'career' ? 'active' : ''} onClick={() => setActiveTab('career')}><Compass size={16} /> Career explorer</button>
          <button type="button" role="tab" aria-selected={activeTab === 'workday'} className={activeTab === 'workday' ? 'active' : ''} onClick={() => setActiveTab('workday')}><BriefcaseBusiness size={16} /> Mini workday</button>
          <button type="button" role="tab" aria-selected={activeTab === 'portfolio'} className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}><FolderKanban size={16} /> Project preview</button>
        </div>

        {activeTab === 'career' && (
          <section className="guest-tool-panel" role="tabpanel">
            <div className="guest-panel-heading"><div><span className="guest-panel-icon"><Compass size={19} /></span><div><p className="eyebrow">01 / CAREER EXPLORER</p><h3>Start with a direction</h3><p>Choose an area that interests you and see the roles, foundations and first steps connected to it.</p></div></div><span className="guest-no-save">Preview only</span></div>
            <div className="guest-career-controls">
              <label className="field-label">Career direction<select className="text-input" value={careerPath} onChange={(event) => chooseCareerPath(event.target.value)}><option value="">Choose a career direction</option>{CAREER_PATHS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="field-label">Role to explore<select className="text-input" value={targetRole} onChange={(event) => chooseTargetRole(event.target.value)} disabled={!careerPath}><option value="">Choose a role</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            </div>
            {careerPath && roadmap ? (
              <div className="guest-career-result">
                <div className="guest-career-summary"><span className="guest-result-kicker">YOUR SELECTED DIRECTION</span><h4>{targetRole || careerPath}</h4><p>{roadmap.summary}</p></div>
                <div className="guest-career-columns">
                  <div><h5><Target size={14} /> Foundational skills</h5><ul>{roadmap.foundations.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><h5><Wrench size={14} /> Common tools</h5><div className="guest-chip-list">{roadmap.tools.slice(0, 6).map((item) => <span key={item}>{item}</span>)}</div></div>
                </div>
                <div className="guest-stage-preview"><h5><BookOpen size={14} /> Your first learning steps</h5><div className="guest-stage-list">{roadmap.stages.slice(0, 3).map((stage, index) => <div key={stage.title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{stage.title}</b><p>{stage.detail}</p></div></div>)}</div></div>
                <div className="guest-panel-footer"><span>Build an account to save this direction and connect it to your projects.</span><div className="guest-career-actions"><button type="button" className="button button-secondary" onClick={() => setActiveTab('workday')}>Practice a workday in this direction <BriefcaseBusiness size={15} /></button><Link href={signupHref} className="button button-primary">Continue with this direction <ArrowRight size={15} /></Link></div></div>
              </div>
            ) : (
              <div className="guest-empty-state"><Compass size={24} /><b>Your career map starts here</b><p>Select a direction above to preview roles, skills and a suggested learning sequence.</p></div>
            )}
          </section>
        )}

        {activeTab === 'workday' && (
          <section className="guest-tool-panel" role="tabpanel">
            <div className="guest-panel-heading"><div><span className="guest-panel-icon"><BriefcaseBusiness size={19} /></span><div><p className="eyebrow">02 / WORKDAY CHALLENGE</p><h3>{demoSimulation?.title ?? 'Practise a workday for your chosen career'}</h3><p>Choose any career direction. The practice scenario will change to match your selection.</p></div></div><span className="guest-no-save">3 decisions</span></div>

            <div className="guest-workday-selectors">
              <label className="field-label">Career direction
                <select className="text-input" value={careerPath} onChange={(event) => chooseCareerPath(event.target.value)}>
                  <option value="">Choose a career direction</option>
                  {CAREER_PATHS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="field-label">Role to practise
                <select className="text-input" value={targetRole} onChange={(event) => chooseTargetRole(event.target.value)} disabled={!careerPath}>
                  <option value="">Choose a role</option>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
            </div>

            {!careerPath ? (
              <div className="guest-empty-state"><Compass size={24} /><b>Choose your career direction first</b><p>Select a career and role above. We'll give you a short workplace scenario designed for that path.</p></div>
            ) : demoSimulation ? (
              <>
                <div className="guest-scenario-brief"><span className="guest-result-kicker">THE SITUATION · {careerPath}</span><p>{demoSimulation.brief}</p><small>{demoSimulation.role} · {demoSimulation.duration}. This guest preview contains three decisions and is not saved to an account.</small></div>
                {!workdayComplete && question ? (
                  <div className="guest-question-card">
                    <div className="guest-question-progress"><span>Decision {questionIndex + 1} of {demoSimulation.questions.length}</span><div><i style={{ width: `${((questionIndex + 1) / demoSimulation.questions.length) * 100}%` }} /></div></div>
                    <h4>{question.prompt}</h4>
                    <div className="guest-answer-options">{question.options.map((option) => <label key={option.id} className={`guest-answer-option ${selectedAnswer === option.id ? 'selected' : ''} ${showFeedback && option.id === question.correctOptionId ? 'correct' : ''}`}><input type="radio" name={`guest-question-${question.id}`} value={option.id} checked={selectedAnswer === option.id} disabled={showFeedback} onChange={() => setSelectedAnswer(option.id)} /><span>{option.label}</span>{showFeedback && option.id === question.correctOptionId && <CheckCircle2 size={17} />}</label>)}</div>
                    {showFeedback && <div className={`guest-answer-feedback ${selectedAnswer === question.correctOptionId ? 'positive' : 'coaching'}`}><b>{selectedAnswer === question.correctOptionId ? 'Good decision.' : 'Here is the stronger approach.'}</b><p>{question.explanation}</p></div>}
                    <div className="guest-question-actions">{showFeedback ? <button type="button" className="button button-primary" onClick={advanceWorkday}>{questionIndex === demoSimulation.questions.length - 1 ? 'See my result' : 'Next decision'} <ArrowRight size={15} /></button> : <button type="button" className="button button-primary" disabled={!selectedAnswer} onClick={checkAnswer}>Check my decision <ArrowRight size={15} /></button>}</div>
                  </div>
                ) : (
                  <div className="guest-workday-result"><span className="guest-result-trophy"><Trophy size={22} /></span><p className="eyebrow">YOUR PRACTICE RESULT · {careerPath}</p><strong>{score} / {demoSimulation.questions.length}</strong><h4>{score === demoSimulation.questions.length ? 'Excellent judgement' : score >= 2 ? 'Good start — keep practising' : 'A useful first practice'}</h4><p>You completed this sample workday. A full account gives you longer simulations, saved attempts and project evidence linked to your chosen career.</p><div className="guest-result-actions"><button className="button button-secondary" type="button" onClick={resetWorkday}><RotateCcw size={15} /> Try again</button><Link href={signupHref} className="button button-primary">Create an account to save my progress <ArrowRight size={15} /></Link></div></div>
                )}
              </>
            ) : (
              <div className="guest-empty-state"><BriefcaseBusiness size={24} /><b>A sample workday is not available yet</b><p>Choose another career direction. More role-specific guest scenarios will be added as the practice library grows.</p></div>
            )}
          </section>
        )}

        {activeTab === 'portfolio' && (
          <section className="guest-tool-panel" role="tabpanel">
            <div className="guest-panel-heading"><div><span className="guest-panel-icon"><FolderKanban size={19} /></span><div><p className="eyebrow">03 / PROJECT PREVIEW</p><h3>Turn a piece of work into evidence</h3><p>Add a few details and see how a project can be presented in a WaleWorks portfolio.</p></div></div><span className="guest-no-save">Browser preview</span></div>
            <div className="guest-project-builder">
              <div className="guest-project-fields">
                <label className="field-label">Project title<input className="text-input" maxLength={90} value={projectTitle} onChange={(event) => { setProjectTitle(event.target.value); setShowProjectPreview(false); }} placeholder="e.g. Student Project Tracker" /></label>
                <label className="field-label">What problem does it address?<textarea className="text-input textarea" rows={4} maxLength={650} value={projectProblem} onChange={(event) => { setProjectProblem(event.target.value); setShowProjectPreview(false); }} placeholder="Describe the problem your work is trying to solve..." /></label>
                <label className="field-label">Skills demonstrated <small>Separate skills with commas</small><input className="text-input" maxLength={220} value={projectSkills} onChange={(event) => { setProjectSkills(event.target.value); setShowProjectPreview(false); }} placeholder="Research, design, testing" /></label>
                <button type="button" className="button button-primary" disabled={!projectTitle.trim() || !projectProblem.trim()} onClick={() => setShowProjectPreview(true)}>Preview my project <ArrowRight size={15} /></button>
              </div>
              <div className="guest-project-preview-wrap">
                {showProjectPreview ? (
                  <article className="guest-project-preview-card"><div className="guest-project-preview-top"><span><Code2 size={16} /> PROJECT PREVIEW</span><span>GUEST DRAFT</span></div><div className="guest-project-preview-mark"><FolderKanban size={23} /></div><p className="eyebrow">PRACTICAL WORK</p><h4>{projectTitle}</h4><p>{projectProblem}</p><div className="guest-chip-list">{projectSkillList.length ? projectSkillList.map((skill) => <span key={skill}>{skill}</span>) : <span>Add skills to describe your contribution</span>}</div><div className="guest-project-preview-bottom"><span><CheckCircle2 size={14} /> Draft preview</span><span>Not published</span></div></article>
                ) : (
                  <div className="guest-project-preview-empty"><FolderKanban size={28} /><b>Your project will appear here</b><p>Enter a title and a short problem statement, then select Preview my project.</p></div>
                )}
              </div>
            </div>
            <div className="guest-panel-footer"><span>Guest drafts are not saved. Create an account to keep projects, upload evidence and build your public portfolio.</span><Link href={signupHref} className="button button-primary">Build my portfolio <ArrowRight size={15} /></Link></div>
          </section>
        )}
      </section>

      <section className="guest-conversion-band">
        <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Keep building beyond the preview.</h2><p>A free account gives you a real profile, saved projects, collaboration, simulations and a shareable portfolio.</p></div>
        <Link href={signupHref} className="button button-light button-large">Create your free account <ArrowRight size={16} /></Link>
      </section>

      <footer className="guest-playground-footer"><Brand compact /><span>Beyond CVs. Show What You Can Build.</span><Link href="/">Back to home <ArrowUpRight size={14} /></Link><small>Guest previews are temporary and are not saved to WaleWorks accounts.</small></footer>
    </main>
  );
}
