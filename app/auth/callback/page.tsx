'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Handles OAuth redirect for PKCE/implicit flows.
// With implicit flow, Supabase automatically reads the session from the URL hash.
// This page just waits for that to happen and redirects home.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // The supabase client picks up the session from the URL hash automatically.
    // Wait briefly for the auth state to settle, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/')
      }
    })

    // Fallback: if no auth state change fires in 3s, redirect anyway
    const timeout = setTimeout(() => router.replace('/'), 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🦝</div>
        <p className="text-gray-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
