'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Truck, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-white">PowertrainOS</h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">Watson Fleet Management</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-6 backdrop-blur-sm">
          <h2 className="text-base font-medium text-white mb-5">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-sidebar-foreground/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-sidebar-border bg-sidebar/50 px-3 py-2 text-sm text-white placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@watson.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sidebar-foreground/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-sidebar-border bg-sidebar/50 px-3 py-2 text-sm text-white placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
