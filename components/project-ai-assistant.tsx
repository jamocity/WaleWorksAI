'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Bot, CheckCircle2, ClipboardList, Lightbulb, LoaderCircle, MessageCircle, RotateCcw, Send, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';

type AssistantMessage = { role: 'user' | 'assistant'; content: string };
type AssistantStatus = {
  configured: boolean;
  provider: 'ollama' | 'groq' | 'unconfigured';
  providerLabel: string;
  model: string | null;
  reason: string | null;
  migrationRequired: boolean;
  migrationError: string | null;
  dailyLimit: number;
  remaining: number;
  resetsAt: string | null;
};
type AssistantTask = 'chat' | 'review' | 'improve_description' | 'identify_skills' | 'next_steps';

const QUICK_ACTIONS: Array<{ task: AssistantTask; label: string; prompt: string; icon: typeof ClipboardList }> = [
  { task: 'review', label: 'Review project', prompt: 'Review my project and give me evidence-based feedback. Identify what is clear, what is missing, important risks or assumptions, and three practical improvements.', icon: ClipboardList },
  { task: 'improve_description', label: 'Improve description', prompt: 'Help me write a clearer, professional project description while preserving only the facts I have provided. Flag any missing details instead of inventing them.', icon: WandSparkles },
  { task: 'identify_skills', label: 'Identify skills', prompt: 'Identify the skills demonstrated by the project details. Separate skills supported by evidence from skills that need more evidence.', icon: Sparkles },
  { task: 'next_steps', label: 'Suggest next steps', prompt: 'Recommend the next practical steps to move this project forward. Prioritise them and explain what a useful result would look like.', icon: Lightbulb },
];

export function ProjectAIAssistant({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [task, setTask] = useState<AssistantTask>('chat');
  const [includeProjectContext, setIncludeProjectContext] = useState(false);
  const [cloudConsent, setCloudConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `/api/projects/${encodeURIComponent(projectId)}/assistant`, [projectId]);

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      const data = await response.json() as AssistantStatus & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not load assistant status.');
      setStatus(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load assistant status.');
    } finally {
      setStatusLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 3) { setError('Write a little more so the assistant knows what you need.'); return; }
    if (!status?.configured) { setError(status?.reason || 'No AI provider is connected.'); return; }
    if (status.provider === 'groq' && !cloudConsent) { setError('Confirm cloud processing consent before using the cloud provider.'); return; }
    if (status.remaining <= 0) { setError('You have reached today\'s AI response limit.'); return; }

    const history = messages.slice(-6);
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          question: cleanQuestion,
          history,
          includeProjectContext,
          cloudConsent,
        }),
      });
      const data = await response.json() as { answer?: string; error?: string; remaining?: number | null };
      if (!response.ok) throw new Error(data.error || 'The assistant could not complete this request.');
      if (!data.answer) throw new Error('The assistant returned an empty response.');
      const newMessages: AssistantMessage[] = [
        { role: 'user', content: cleanQuestion },
        { role: 'assistant', content: data.answer },
      ];
      setMessages((current) => [...current, ...newMessages].slice(-12));
      setQuestion('');
      if (typeof data.remaining === 'number') setStatus((current) => current ? { ...current, remaining: data.remaining! } : current);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'The assistant could not complete this request.');
      await refreshStatus();
    } finally {
      setBusy(false);
    }
  }

  const providerIsCloud = status?.provider === 'groq';

  return <section className="project-ai-assistant workboard-panel" aria-labelledby="project-ai-assistant-title">
    <div className="workboard-panel-heading project-ai-heading">
      <span className="workboard-icon"><Sparkles size={18}/></span>
      <div><h2 id="project-ai-assistant-title">AI Project Assistant</h2><p>Get help improving documentation, finding evidence-backed skills and planning your next steps.</p></div>
      <span className="project-ai-provider-chip"><span className={`project-ai-provider-dot ${status?.configured ? 'is-ready' : ''}`}/>{statusLoading ? 'Checking' : status?.providerLabel || 'Unavailable'}</span>
    </div>

    {status?.migrationRequired && <div className="form-alert error">{status.migrationError || 'AI usage controls are not set up.'} Run the AI assistant migration included with this update.</div>}
    {!statusLoading && status && !status.configured && <div className="project-ai-setup-note"><Bot size={18}/><div><b>AI provider not connected</b><p>{status.reason} The assistant interface is ready, but it will not generate pretend or template answers.</p></div></div>}
    {status?.configured && <div className="project-ai-quota-row"><span><ShieldCheck size={14}/> {status.dailyLimit} responses per account each day</span><b>{status.remaining} remaining today</b></div>}

    <div className="project-ai-quick-actions" aria-label="Assistant actions">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return <button key={action.task} type="button" className={`project-ai-action ${task === action.task ? 'is-selected' : ''}`} onClick={() => { setTask(action.task); setQuestion(action.prompt); }} disabled={busy || !status?.configured || status.migrationRequired}><Icon size={14}/>{action.label}</button>;
      })}
    </div>

    <div className="project-ai-chat" aria-live="polite">
      {messages.length === 0 ? <div className="project-ai-empty"><span><Bot size={21}/></span><div><b>What are you working on?</b><p>Choose a suggested action or ask a question. Responses are coaching suggestions—not verified assessments or automatic project edits.</p></div></div> : messages.map((message, index) => <article key={`${index}-${message.role}`} className={`project-ai-message ${message.role}`}><span className="project-ai-message-icon">{message.role === 'assistant' ? <Sparkles size={14}/> : <MessageCircle size={14}/>}</span><div><small>{message.role === 'assistant' ? 'WALEWORKS AI' : 'YOU'}</small><p>{message.content}</p></div></article>)}
    </div>

    <form className="project-ai-form" onSubmit={sendMessage}>
      <label className="field-label" htmlFor={`project-ai-question-${projectId}`}>Your question or instruction<textarea id={`project-ai-question-${projectId}`} className="text-input textarea" rows={3} maxLength={3000} value={question} onChange={(event) => setQuestion(event.target.value)} disabled={busy || !status?.configured || status.migrationRequired} placeholder="e.g. How can I make my project objectives more measurable?"/></label>
      <div className="project-ai-consent-options">
        <label className="project-ai-checkbox"><input type="checkbox" checked={includeProjectContext} onChange={(event) => setIncludeProjectContext(event.target.checked)} disabled={busy}/><span><b>Share project details</b><small>Only sends the project title, description, problem, objectives, method, status, outcomes, lessons and skills. It never sends uploaded files, comments, teammate details or external links.</small></span></label>
        {providerIsCloud && <label className="project-ai-checkbox cloud"><input type="checkbox" checked={cloudConsent} onChange={(event) => setCloudConsent(event.target.checked)} disabled={busy}/><span><b>I consent to cloud AI processing</b><small>Your message is sent to Groq. Project details are sent only when the separate option above is enabled. Do not enter confidential or sensitive information.</small></span></label>}
      </div>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      <div className="project-ai-form-footer"><span>{status?.configured ? `${status.providerLabel} · ${status.model || ''}` : 'Connect a provider to activate responses'}</span><div className="project-ai-form-buttons"><button type="button" className="button button-secondary button-small" onClick={() => { setMessages([]); setError(''); }} disabled={busy || messages.length === 0}><RotateCcw size={13}/> Clear chat</button><button type="submit" className="button button-primary button-small" disabled={busy || statusLoading || !status?.configured || status.migrationRequired || (status?.remaining ?? 0) <= 0 || (providerIsCloud && !cloudConsent)}>{busy ? <LoaderCircle size={14} className="spin"/> : <Send size={14}/>} {busy ? 'Thinking…' : 'Ask assistant'}</button></div></div>
    </form>
    <p className="project-ai-disclaimer"><CheckCircle2 size={13}/> Your conversation is held in this page only and is not saved to WaleWorks. Each request attempt uses one of your daily responses. The assistant does not change your project automatically.</p>
  </section>;
}
