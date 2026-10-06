'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)

  const signIn = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined'
          ? window.location.origin + '/'
          : '/',
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="text-7xl mb-4">🦝</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Arc</h1>
        <p className="text-gray-400 text-sm mt-2">Winter Arc Fitness Tracker</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => signIn('google')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold text-sm py-3.5 rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading === 'google' ? (
            <span className="text-gray-500 text-xs">Signing in...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        <button
          onClick={() => signIn('apple')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 bg-black border border-white/10 text-white font-semibold text-sm py-3.5 rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading === 'apple' ? (
            <span className="text-gray-400 text-xs">Signing in...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.2-57.3-155.5-127.3c-58-81.9-105.8-209.2-105.8-330.4 0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
              Continue with Apple
            </>
          )}
        </button>
      </div>
      <p className="text-gray-600 text-xs mt-10 text-center max-w-xs">
        Your data is private and isolated to your account. No one else can see your logs.
      </p>
    </div>
  )
}
