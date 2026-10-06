'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Handles OAuth redirect for PKCE flow.
// Supabase sends ?code= in the redirect URL; we exchange it for a session.
function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(() => {
          // Full reload instead of client-side navigation.
          // router.replace('/') can race with React committing the auth state update,
          // causing AuthProvider to redirect back to /login with stale user=null.
          // window.location forces a fresh module init, so getSession() reads the
          // newly-stored session from localStorage before any redirect check runs.
          window.location.href = '/'
        })
        .catch(() => {
          window.location.href = '/login'
        })
    } else {
      window.location.href = '/login'
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🦝</div>
        <p className="text-gray-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🦝</div>
          <p className="text-gray-400 text-sm">Signing you in...</p>
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
