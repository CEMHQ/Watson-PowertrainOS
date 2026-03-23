import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

// ─── Server client (use in Server Components, API routes, middleware) ─────────

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignore: Server Component calling set — safe to swallow
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}

// ─── Admin client (use only in API routes, never exposed to client) ───────────

export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function getServerUser() {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function requireServerUser() {
  const user = await getServerUser()
  if (!user) throw new Error('Unauthorized')
  return user
}
