import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next') ?? '/dashboard';
  let redirectUrl = new URL('/dashboard', origin);
  try {
    const candidate = new URL(requestedNext, origin);
    if (candidate.origin === origin) redirectUrl = candidate;
  } catch {
    // Invalid redirect targets fall back to the dashboard.
  }
  if (code) {
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/auth/login?error=confirmation_failed', origin));
    return response;
  }
  return NextResponse.redirect(new URL('/auth/login', origin));
}
