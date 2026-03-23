'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Loader2, Shield, Users, AlertTriangle, CheckCircle2, Truck } from 'lucide-react'
import { Oswald, DM_Sans } from 'next/font/google'

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] })

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2e4593]/20 focus:border-[#2e4593] transition-all duration-150'

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-widest"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function ConfirmStep({ email }: { email: string }) {
  return (
    <div className={`${dmSans.className} min-h-screen flex items-center justify-center bg-[#f8f9fc] px-4`}>
      <div className="text-center max-w-sm">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center mb-8 shadow-sm">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className={`${oswald.className} text-3xl font-bold text-gray-900 mb-3 tracking-wide`}>
          CHECK YOUR EMAIL
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-3">
          We sent a confirmation link to
        </p>
        <p className="text-[#2e4593] font-semibold text-sm mb-8 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 inline-block">
          {email}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed">
          Click the link in your email to activate your PowertrainOS account.
          <br />
          Check your spam folder if you don&apos;t see it within a minute.
        </p>
      </div>
    </div>
  )
}

function LeftPanel({ oswaldClass }: { oswaldClass: string }) {
  const features = [
    {
      Icon: Shield,
      label: 'DOT Compliance Engine',
      desc: 'CDL · Med Cards · Drug Tests · Violations',
    },
    {
      Icon: Users,
      label: 'Workforce Hub',
      desc: 'Employees · Roles · Documents · Onboarding',
    },
    {
      Icon: AlertTriangle,
      label: 'Safety & Incidents',
      desc: 'Reports · Investigations · Risk Scores',
    },
  ]

  return (
    <div
      className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0b1735 0%, #1f3471 50%, #2e4593 100%)',
      }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
        }}
      />

      {/* Amber diagonal accent strip */}
      <div
        className="absolute right-0 top-0 w-1.5 h-full opacity-80"
        style={{ background: 'linear-gradient(to bottom, #f59e0b, #d97706 60%, transparent)' }}
      />

      {/* Large decorative W watermark */}
      <div
        className={`${oswaldClass} absolute -bottom-8 -left-4 text-[320px] font-bold leading-none select-none pointer-events-none`}
        style={{ color: 'rgba(255,255,255,0.02)' }}
      >
        W
      </div>

      {/* Top: Wordmark */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-14">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className={`${oswaldClass} text-white text-lg font-semibold tracking-[0.15em] uppercase`}>
              PowertrainOS
            </span>
            <p className="text-blue-300/50 text-[10px] tracking-widest uppercase -mt-0.5">
              Watson Fleet Management
            </p>
          </div>
        </div>

        <h1
          className={`${oswaldClass} text-5xl xl:text-6xl font-bold text-white leading-[1.05] mb-6`}
        >
          FLEET OPS.
          <br />
          <span style={{ color: '#f59e0b' }}>SIMPLIFIED.</span>
        </h1>

        <p className="text-blue-200/60 text-[15px] leading-relaxed max-w-[280px]">
          The workforce and compliance operating system built for Watson&apos;s truck and hopper
          fleet operations across New Mexico.
        </p>
      </div>

      {/* Middle: Feature list */}
      <div className="relative z-10 space-y-3">
        {features.map(({ Icon, label, desc }, i) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl px-4 py-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div
              className="rounded-xl p-2.5 flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}
            >
              <Icon className="h-4 w-4" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none mb-1">{label}</p>
              <p className="text-blue-300/50 text-[11px] tracking-wide">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Entity */}
      <div className="relative z-10">
        <div className="h-px w-12 mb-4" style={{ background: 'rgba(245,158,11,0.4)' }} />
        <p className="text-blue-300/30 text-xs leading-relaxed">
          Watson Truck &amp; Supply, Inc.
          <br />
          Watson Hopper Inc. · Hobbs, NM
        </p>
      </div>
    </div>
  )
}

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setStep('confirm')
      setLoading(false)
    }
  }

  if (step === 'confirm') return <ConfirmStep email={email} />

  return (
    <div className={`${dmSans.className} min-h-screen flex`}>
      <LeftPanel oswaldClass={oswald.className} />

      {/* Right: Auth panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 bg-[#f8f9fc]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span
              className={`${oswald.className} text-gray-900 text-lg font-semibold tracking-widest uppercase`}
            >
              PowertrainOS
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-white border border-gray-200 p-1 mb-8 shadow-sm">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  mode === m
                    ? 'bg-[#2e4593] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <h2
              className={`${oswald.className} text-2xl font-bold text-gray-900 tracking-wide mb-1`}
            >
              {mode === 'signin' ? 'WELCOME BACK' : 'GET STARTED'}
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              {mode === 'signin'
                ? 'Sign in to your fleet management account'
                : 'Create your PowertrainOS account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <Field label="Full Name" id="fullName">
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Watson"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Email Address" id="email">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@watson.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Password" id="password">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={mode === 'signup' ? 8 : undefined}
                  className={inputClass}
                />
                {mode === 'signup' && (
                  <p className="text-[11px] text-gray-400 mt-1.5 pl-1">Minimum 8 characters</p>
                )}
              </Field>

              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60 transition-all duration-200 mt-2"
                style={{
                  background: loading
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #2e4593 0%, #1f3471 100%)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(46,69,147,0.35)',
                }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? mode === 'signin'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'signin'
                  ? 'Sign in to PowertrainOS'
                  : 'Create my account'}
              </button>
            </form>

            <p className="text-[12px] text-center text-gray-400 mt-6">
              {mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-[#2e4593] font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-[#2e4593] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="text-[11px] text-center text-gray-400 mt-6 tracking-wide">
            Watson Truck &amp; Supply, Inc. · Hobbs, NM · Internal Platform
          </p>
        </div>
      </div>
    </div>
  )
}
