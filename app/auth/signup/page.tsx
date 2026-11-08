import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return <><p className="eyebrow">START YOUR PORTFOLIO</p><h2>Create your account</h2><p className="auth-intro">Start documenting the work you do and the skills you are building.</p><AuthForm mode="signup" /><p className="auth-terms-note">WaleWorks AI is currently piloting with Wale University. You can join with your personal or university email.</p></>;
}
