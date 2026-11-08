import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-side-panel"><div className="auth-side-inner"><Brand /><div className="auth-side-message"><p className="eyebrow">YOUR WORK HAS A STORY</p><h1>Make the work<br />you do <span>count.</span></h1><p>Capture the process. Show your practical skills. Build a portfolio that grows with every project.</p><div className="auth-side-quote"><span>“</span><p>Your professional story is more than a list of qualifications. It is the evidence of what you can do.</p></div></div><small>© 2026 WaleWorks AI</small></div></div><div className="auth-main"><Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to home</Link><div className="auth-form-panel">{children}</div><div className="auth-footer">By continuing, you agree to use WaleWorks responsibly and respect the ownership and privacy of other people's work.</div></div></main>;
}
