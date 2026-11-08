import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, Code2, FileText, Globe2,
  Layers3, LockKeyhole, ShieldCheck, Sparkles, Users2,
} from 'lucide-react';
import { Brand } from '@/components/brand';

const steps = [
  { number: '01', title: 'Build in public, on your terms', description: 'Create a project space for the work you are doing. Document the problem, your approach, progress and outcomes.' },
  { number: '02', title: 'Make your skills visible', description: 'Connect skills to evidence. Give mentors and future employers context beyond a list of keywords.' },
  { number: '03', title: 'Share a living portfolio', description: 'Turn your best work into a professional page you can keep improving throughout your university journey.' },
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <div className="marketing-header-inner"><Brand /><nav><a href="#how-it-works">How it works</a><a href="#why-waleworks">Why WaleWorks</a><Link href="/auth/login">Sign in</Link></nav><Link href="/auth/signup" className="button button-primary button-header">Create your portfolio <ArrowRight size={15} /></Link></div>
      </header>

      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-content">
          <div className="pilot-pill"><span className="pilot-dot" /> Built for the next generation of builders <span>·</span> Wale University pilot</div>
          <h1>Your CV tells them<br />what you <span>know.</span><br />Your work shows what<br />you can <span className="hero-highlight">do.</span></h1>
          <p className="hero-description">A living portfolio for student projects, practical skills and real-world problem solving. Build evidence of your ability while you are still learning.</p>
          <div className="hero-actions"><Link href="/auth/signup" className="button button-primary button-large">Start building your portfolio <ArrowRight size={18} /></Link><a href="#how-it-works" className="hero-text-link">See how it works <ArrowUpRight size={16} /></a></div>
          <div className="hero-trust-row"><span><ShieldCheck size={15} /> You control what is public</span><span><LockKeyhole size={15} /> Private by default for projects</span><span><Globe2 size={15} /> Built for every discipline</span></div>
        </div>
        <div className="hero-visual" aria-label="Preview of the WaleWorks student workspace">
          <div className="visual-window">
            <div className="visual-window-top"><div className="window-dots"><i /><i /><i /></div><span>app.waleworks.ai / dashboard</span><div className="visual-online"><b /> PRODUCT PREVIEW</div></div>
            <div className="visual-app">
              <aside className="visual-sidebar"><div className="visual-brand"><span><Layers3 size={14} /></span> WaleWorks</div><div className="visual-sidelabel">WORKSPACE</div><div className="visual-nav active"><i /> Overview</div><div className="visual-nav"><i /> My projects</div><div className="visual-nav"><i /> My profile</div><div className="visual-sidelabel second">DISCOVER</div><div className="visual-nav"><i /> Challenges</div><div className="visual-nav"><i /> AI assistant</div><div className="visual-mini-user"><div>AO</div><span><b>Amara Okafor</b><small>Student workspace</small></span></div></aside>
              <div className="visual-main"><div className="visual-greeting"><span>ILLUSTRATIVE STUDENT WORKSPACE</span><b>Good morning, Amara <span>✦</span></b><small>Your work is taking shape. Keep the momentum going.</small></div>
                <div className="visual-stats"><div><small>PROJECTS</small><b>04</b><span>+2 this semester</span></div><div><small>SKILLS EVIDENCED</small><b>08</b><span>Across 4 projects</span></div><div><small>PORTFOLIO VIEWS</small><b>126</b><span>Last 30 days</span></div></div>
                <div className="visual-work-head"><b>Recent project work</b><span>View all <ArrowUpRight size={11} /></span></div>
                <div className="visual-project"><div className="visual-project-icon blue"><Code2 size={17} /></div><div className="visual-project-info"><b>Community Water Monitor</b><small>Engineering · In progress</small><div className="visual-progress"><i style={{ width: '68%' }} /></div></div><span className="visual-status">PUBLIC</span></div>
                <div className="visual-project"><div className="visual-project-icon purple"><FileText size={17} /></div><div className="visual-project-info"><b>Urban Waste Mapping Study</b><small>Research · Completed</small><div className="visual-progress"><i style={{ width: '100%' }} /></div></div><span className="visual-status">PUBLIC</span></div>
                <div className="visual-ai-note"><span><Sparkles size={14} /></span><div><b>Your work, with context.</b><small>AI project insights will help surface skills and areas to improve — with every assessment clearly labelled.</small></div><em>COMING SOON</em></div>
              </div>
            </div>
          </div>
          <div className="floating-proof proof-one"><span><CheckCircle2 size={16} /></span><div><b>Evidence over claims</b><small>Work you can point to</small></div></div>
          <div className="floating-proof proof-two"><span><Users2 size={16} /></span><div><b>Every discipline</b><small>Not just tech projects</small></div></div>
        </div>
        <div className="hero-bottom-label"><span>01 — THE STUDENT WORKSPACE</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="manifesto-section" id="why-waleworks">
        <div className="manifesto-number">01 / THE GAP</div><div className="manifesto-copy"><p className="eyebrow">THE PROBLEM WE ARE SOLVING</p><h2>Learning is happening.<br /><span>Proof is often missing.</span></h2><p>Students complete research, build prototypes, solve problems, lead teams and learn by doing. But much of that work stays buried in folders, group chats and assignment submissions.</p><p>WaleWorks gives practical learning a permanent home — so students can document what they build, make their contribution visible and show the thinking behind the result.</p></div>
      </section>

      <section className="how-section" id="how-it-works"><div className="section-kicker">02 / THE PRODUCT</div><div className="how-heading"><div><p className="eyebrow">A BETTER WAY TO SHOW YOUR WORK</p><h2>From classwork to<br /><span>career evidence.</span></h2></div><p>Not another course platform. Not another job board. A practical record of what you can do, how you think and what you are learning to build.</p></div><div className="steps-grid">{steps.map((step) => <article className="step-card" key={step.number}><span>{step.number}</span><div className="step-line" /><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>

      <section className="feature-band"><div className="feature-band-copy"><p className="eyebrow">MADE FOR REAL WORK</p><h2>Your discipline.<br />Your kind of impact.</h2><p>From a software prototype to a public-health study, a business case, an agricultural experiment or a creative portfolio. Your work deserves structure and visibility.</p><Link href="/auth/signup" className="button button-light">Create your portfolio <ArrowRight size={16} /></Link></div><div className="discipline-grid"><div><Code2 /><b>Technology</b><small>Software · Data · AI</small></div><div><Layers3 /><b>Engineering</b><small>Design · Prototypes</small></div><div><Users2 /><b>Health & society</b><small>Research · Community</small></div><div><Sparkles /><b>Creative fields</b><small>Arts · Media · Design</small></div><div><Globe2 /><b>Agriculture</b><small>Food · Climate · Systems</small></div><div><FileText /><b>Business & more</b><small>Strategy · Operations</small></div></div></section>

      <section className="final-cta"><p className="eyebrow">YOUR WORK SHOULD TRAVEL FURTHER</p><h2>Don't just say you can.<br /><span>Show what you built.</span></h2><p>Start documenting your work today. Your portfolio grows with you.</p><Link href="/auth/signup" className="button button-primary button-large">Build your WaleWorks profile <ArrowRight size={17} /></Link></section>
      <footer className="marketing-footer"><Brand /><span>Beyond CVs. Show What You Can Build.</span><small>© 2026 WaleWorks AI · Wale University pilot</small></footer>
    </main>
  );
}
