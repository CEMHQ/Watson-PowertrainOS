'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const inputClass =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

const PLANS = [
  { value: 'mec',      label: 'MEC Plan',      empOnly: '$0/paycheck',  family: '$71.54/paycheck' },
  { value: 'standard', label: 'Standard Plan',  empOnly: '$81/paycheck', family: '$187/paycheck'   },
  { value: 'buy_up',   label: 'Buy Up Plan',    empOnly: '$96/paycheck', family: '$222/paycheck'   },
  { value: 'none',     label: 'No Medical',     empOnly: '—',            family: '—'               },
]

const TIERS = [
  { value: 'employee_only',     label: 'Employee Only'     },
  { value: 'employee_spouse',   label: 'Employee + Spouse' },
  { value: 'employee_children', label: 'Employee + Children' },
  { value: 'employee_family',   label: 'Employee + Family' },
]

const AUTHORIZED_SLOTS = [1, 2, 3] as const

export default function GroupHealthPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [plan, setPlan] = useState('mec')
  const [tier, setTier] = useState('employee_only')
  const [refusalReason, setRefusalReason] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [authorized, setAuthorized] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' },
  ])

  useEffect(() => {
    fetch(`/api/benefits/health?employeeId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setPlan(data.healthPlan ?? 'mec')
          setTier(data.coverageTier ?? 'employee_only')
          setRefusalReason(data.refusalReason ?? '')
          setEffectiveDate(data.effectiveDate ?? '')
          setAuthorized([
            { name: data.authorizedPerson1Name ?? '', phone: data.authorizedPerson1Phone ?? '' },
            { name: data.authorizedPerson2Name ?? '', phone: data.authorizedPerson2Phone ?? '' },
            { name: data.authorizedPerson3Name ?? '', phone: data.authorizedPerson3Phone ?? '' },
          ])
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/benefits/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: id,
        healthPlan: plan,
        coverageTier: plan === 'none' ? null : tier,
        refusalReason: plan === 'none' ? (refusalReason || null) : null,
        effectiveDate: effectiveDate || null,
        authorizedPerson1Name: authorized[0].name || null,
        authorizedPerson1Phone: authorized[0].phone || null,
        authorizedPerson2Name: authorized[1].name || null,
        authorizedPerson2Phone: authorized[1].phone || null,
        authorizedPerson3Name: authorized[2].name || null,
        authorizedPerson3Phone: authorized[2].phone || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save enrollment')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading enrollment…</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <Link
          href={`/benefits/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Enrollment Hub
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Group Health Insurance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">IMS Managed Care — Group SWT0906</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan selection */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 bg-muted/30 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Plan Selection</h2>
          </div>
          <div className="p-5 space-y-3">
            {PLANS.map((p) => (
              <label
                key={p.value}
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  plan === p.value
                    ? 'border-primary bg-accent/50'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.value}
                  checked={plan === p.value}
                  onChange={() => setPlan(p.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  {p.value !== 'none' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Emp only: {p.empOnly} · With family: {p.family}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Coverage tier (if plan selected) */}
        {plan !== 'none' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <label className={`${labelClass} mb-3`}>Coverage Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    tier === t.value
                      ? 'border-primary bg-accent/50 text-foreground font-medium'
                      : 'border-border text-muted-foreground hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.value}
                    checked={tier === t.value}
                    onChange={() => setTier(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Refusal reason */}
        {plan === 'none' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <label className={labelClass}>Reason for Declining Coverage</label>
            <textarea
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="e.g., Covered under spouse's plan…"
            />
          </div>
        )}

        {/* Effective date */}
        <div className="rounded-lg border border-border bg-card p-5">
          <label className={labelClass}>Effective Date</label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* HIPAA Authorization */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 bg-muted/30 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">HIPAA Authorization</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Persons authorized to receive your health information (optional)
            </p>
          </div>
          <div className="p-5 space-y-4">
            {AUTHORIZED_SLOTS.map((slot, i) => (
              <div key={slot} className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Person {slot} Name</label>
                  <input
                    value={authorized[i].name}
                    onChange={(e) => {
                      const a = [...authorized]
                      a[i] = { ...a[i], name: e.target.value }
                      setAuthorized(a)
                    }}
                    className={inputClass}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    value={authorized[i].phone}
                    onChange={(e) => {
                      const a = [...authorized]
                      a[i] = { ...a[i], phone: e.target.value }
                      setAuthorized(a)
                    }}
                    className={inputClass}
                    placeholder="575-000-0000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Group health enrollment saved.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Enrollment'}
          </button>
          {saved && (
            <button
              type="button"
              onClick={() => router.push(`/benefits/${id}/life`)}
              className="rounded-md px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Continue to Life Insurance →
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
