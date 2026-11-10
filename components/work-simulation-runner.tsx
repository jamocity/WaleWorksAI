'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, LoaderCircle, Target } from 'lucide-react';
import type { WorkSimulation } from '@/lib/work-simulations';

type Result = {
  score: number;
  correctCount: number;
  total: number;
  answers: Record<string, string>;
  questionResults: { id: string; prompt: string; correct: boolean; chosenLabel: string; correctLabel: string; explanation: string }[];
};

export function WorkSimulationRunner({ simulation }: { simulation: WorkSimulation }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [deliverable, setDeliverable] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const answeredCount = useMemo(() => simulation.questions.filter((question) => Boolean(answers[question.id])).length, [answers, simulation.questions]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (answeredCount !== simulation.questions.length) {
      setError('Answer every decision question before submitting your workday.');
      return;
    }
    if (deliverable.trim().length < 40) {
      setError('Your written handover must be at least 40 characters so there is enough detail to review.');
      return;
    }

    setSubmitting(true);
    try {
      const questionResults = simulation.questions.map((question) => {
        const selected = question.options.find((option) => option.id === answers[question.id]);
        const correct = answers[question.id] === question.correctOptionId;
        const correctOption = question.options.find((option) => option.id === question.correctOptionId);
        return {
          id: question.id,
          prompt: question.prompt,
          correct,
          chosenLabel: selected?.label ?? 'No response',
          correctLabel: correctOption?.label ?? '',
          explanation: question.explanation,
        };
      });
      const correctCount = questionResults.filter((item) => item.correct).length;
      const score = Math.round((correctCount / questionResults.length) * 100);
      const response = await fetch('/api/work-simulations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationSlug: simulation.slug, answers, deliverable: deliverable.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Your simulation could not be saved. Please try again.');
      setResult({ score: payload.score ?? score, correctCount: payload.correctCount ?? correctCount, total: questionResults.length, answers, questionResults: payload.questionResults ?? questionResults });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your simulation could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="simulation-result-page">
        <div className="simulation-result-hero">
          <span className="simulation-result-icon"><CheckCircle2 size={24} /></span>
          <p className="eyebrow">WORKDAY SUBMITTED</p>
          <h2>{result.score}% decision score</h2>
          <p>You selected {result.correctCount} of {result.total} best-practice decisions. Your written handover has also been saved.</p>
          <div className="simulation-score-track"><span style={{ width: `${result.score}%` }} /></div>
          <small>Practice score only · not a certification or employment assessment</small>
        </div>
        <section className="simulation-review-card">
          <div className="simulation-section-heading"><div><p className="eyebrow">LEARN FROM THE DECISIONS</p><h3>Decision review</h3></div></div>
          {result.questionResults.map((item, index) => (
            <article className="simulation-answer-review" key={item.id}>
              <div className="simulation-answer-review-top"><strong>{String(index + 1).padStart(2, '0')} · {item.prompt}</strong><span className={item.correct ? 'answer-correct' : 'answer-incorrect'}>{item.correct ? 'Best-practice choice' : 'Review this choice'}</span></div>
              <p><b>Your response:</b> {item.chosenLabel}</p>
              {!item.correct && <p><b>Recommended response:</b> {item.correctLabel}</p>}
              <small>{item.explanation}</small>
            </article>
          ))}
        </section>
        <section className="simulation-review-card">
          <p className="eyebrow">YOUR WRITTEN WORK</p>
          <h3>{simulation.deliverableTitle}</h3>
          <p className="simulation-written-preview">{deliverable}</p>
          <div className="simulation-rubric"><strong>Self-review checklist</strong>{simulation.rubric.map((item) => <div key={item}><CheckCircle2 size={14} />{item}</div>)}</div>
          <p className="simulation-disclaimer">Your free-text response is stored but not automatically graded in this version. A future mentor/AI review workflow can assess it separately and label the reviewer clearly.</p>
        </section>
        <div className="simulation-actions"><Link className="button button-secondary" href="/dashboard/work-simulations"><ArrowLeft size={15} /> Back to simulations</Link><Link className="button button-primary" href="/dashboard/projects/new">Document this practice <ArrowRight size={15} /></Link></div>
      </div>
    );
  }

  return (
    <form className="simulation-runner" onSubmit={submit}>
      <div className="simulation-progress-row"><span>{answeredCount} of {simulation.questions.length} decisions answered</span><span>{Math.round((answeredCount / simulation.questions.length) * 100)}% complete</span></div>
      <div className="simulation-progress-track"><span style={{ width: `${(answeredCount / simulation.questions.length) * 100}%` }} /></div>
      <div className="simulation-workplace-note"><CircleHelp size={17} /><p><b>Workplace rule:</b> Act as a junior colleague. Do not invent facts, expose credentials, bypass approval or make risky production changes just to appear decisive.</p></div>

      {simulation.questions.map((question, index) => (
        <section className="simulation-question-card" key={question.id}>
          <div className="simulation-question-meta"><span>DECISION {String(index + 1).padStart(2, '0')}</span><small>{answeredCount > index ? 'Response selected' : 'Choose one response'}</small></div>
          <h3>{question.prompt}</h3>
          <div className="simulation-options">
            {question.options.map((option) => (
              <label className={`simulation-option ${answers[question.id] === option.id ? 'selected' : ''}`} key={option.id}>
                <input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="simulation-question-card simulation-deliverable-card">
        <div className="simulation-question-meta"><span>YOUR WORKPLACE DELIVERABLE</span><small>Written response</small></div>
        <h3>{simulation.deliverableTitle}</h3>
        <p>{simulation.deliverablePrompt}</p>
        <textarea className="text-input textarea" rows={7} minLength={40} required value={deliverable} onChange={(event) => setDeliverable(event.target.value)} placeholder="Write the message, handover, defect report or analysis you would submit at work..." />
        <div className="simulation-rubric"><strong>Use this checklist before submitting</strong>{simulation.rubric.map((item) => <div key={item}><Target size={14} />{item}</div>)}</div>
      </section>

      {error && <div className="form-alert error" role="alert">{error}</div>}
      <div className="simulation-submit-row"><p>Submitted attempts are saved to your WaleWorks account. You can retry a simulation later.</p><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? <LoaderCircle size={16} className="spin" /> : <CheckCircle2 size={16} />}{submitting ? 'Submitting workday...' : 'Submit workday'}</button></div>
    </form>
  );
}
