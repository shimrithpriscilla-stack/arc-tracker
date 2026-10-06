import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Server-side OAuth callback handler for PKCE flow.
// IMPORTANT: cookies must be read from request and written directly onto the
// redirect NextResponse — NOT via `await cookies()` from next/headers.
// Using cookies() + NextResponse.redirect() creates two separate response
// objects; the session cookies set on the first never reach the browser.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Build the success redirect first so we can attach cookies to it
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
      {
        cookies: {
          // Read PKCE code verifier from the incoming request cookies
          getAll() {
            return request.cookies.getAll()
          },
          // Write the new session tokens directly onto the redirect response
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response  // redirect carries the session cookies ✓
    }

    // Surface the error in Vercel function logs
    console.error('[auth/callback] code exchange failed:', error.message)
  }

  // Exchange failed or no code — redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
