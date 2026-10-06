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
        .then(() => router.replace('/'))
        .catch(() => router.replace('/login'))
    } else {
      router.replace('/login')
    }
  }, [router, searchParams])

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
