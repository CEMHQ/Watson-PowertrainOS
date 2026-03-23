import { createBrowserClient } from '@supabase/ssr'

// ─── Browser client (use in Client Components only) ───────────────────────────

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
