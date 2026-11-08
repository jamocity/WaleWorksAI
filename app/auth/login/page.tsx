import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return <><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your workspace</h2><p className="auth-intro">Pick up where you left off. Your projects are right where you left them.</p><AuthForm mode="login" /></>;
}
