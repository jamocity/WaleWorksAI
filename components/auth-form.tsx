'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CAREER_PATHS, CAREER_ROLES_BY_PATH } from '@/lib/career-paths';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function getOnboardingDestination() {
    const params = new URLSearchParams(window.location.search);
    const requestedPath = params.get('careerPath') ?? '';
    const requestedRole = params.get('targetRole') ?? '';
    const careerPath = CAREER_PATHS.find((path) => path === requestedPath) ?? '';
    const targetRole = careerPath && (CAREER_ROLES_BY_PATH[careerPath] ?? []).includes(requestedRole)
      ? requestedRole
      : '';
    const nextParams = new URLSearchParams();
    if (careerPath) nextParams.set('careerPath', careerPath);
    if (targetRole) nextParams.set('targetRole', targetRole);
    const query = nextParams.toString();
    return query ? `/onboarding?${query}` : '/onboarding';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === 'signup') {
        const onboardingDestination = getOnboardingDestination();
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingDestination)}`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push(onboardingDestination);
          router.refresh();
        } else {
          setMessage('Your account has been created. Check your email to confirm your address, then sign in to continue.');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === 'signup' && (
        <label className="field-label">Full name
          <span className="input-wrap"><UserRound size={17} /><input autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Amara Okafor" /></span>
        </label>
      )}
      <label className="field-label">Email address
        <span className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" /></span>
      </label>
      <label className="field-label">Password
        <span className="input-wrap"><LockKeyhole size={17} /><input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></span>
      </label>
      {error && <div className="form-alert error" role="alert">{error}</div>}
      {message && <div className="form-alert success" role="status">{message}</div>}
      <button className="button button-primary button-full" disabled={loading} type="submit">
        {loading ? <LoaderCircle size={17} className="spin" /> : null}
        {mode === 'signup' ? 'Create your account' : 'Sign in'} <ArrowRight size={17} />
      </button>
      <p className="auth-switch">
        {mode === 'signup' ? 'Already have an account?' : 'New to WaleWorks AI?'}{' '}
        <Link href={mode === 'signup' ? '/auth/login' : '/auth/signup'}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </form>
  );
}
