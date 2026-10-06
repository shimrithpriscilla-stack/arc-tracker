import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Singleton browser client — uses cookies (via @supabase/ssr) so session is
// visible to Next.js middleware and server components without any race conditions.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Returns the current authenticated user's ID, or throws if not authenticated
export async function requireUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}
