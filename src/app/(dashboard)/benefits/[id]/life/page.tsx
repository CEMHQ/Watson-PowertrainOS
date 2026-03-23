'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const inputClass =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

const ENROLLMENT_TYPES = [
  { value: 'initial',       label: 'Initial Enrollment'    },
  { value: 're_enrollment', label: 'Re-Enrollment'         },
  { value: 'add',           label: 'Add Coverage'          },
  { value: 'drop',          label: 'Drop Coverage'         },
  { value: 'change',        label: 'Change Coverage'       },
]

const DENTAL_RATES = [
  { value: 'employee_only',     label: 'Employee Only',     monthly: '$28.36', percheck: '$13.09' },
  { value: 'employee_spouse',   label: 'Employee + Spouse', monthly: '$57.29', percheck: '$26.44' },
  { value: 'employee_children', label: 'Employee + Children', monthly: '$68.25', percheck: '$31.50' },
  { value: 'employee_family',   label: 'Employee + Family', monthly: '$97.19', percheck: '$44.86' },
]

const VISION_RATES = [
  { value: 'employee_only',     label: 'Employee Only',     monthly: '$7.97',  percheck: '$3.68' },
  { value: 'employee_spouse',   label: 'Employee + Spouse', monthly: '$13.40', percheck: '$6.19' },
  { value: 'employee_children', label: 'Employee + Children', monthly: '$13.67', percheck: '$6.31' },
  { value: 'employee_family',   label: 'Employee + Family', monthly: '$21.64', percheck: '$9.99' },
]

export default function LifeInsurancePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [enrollmentType, setEnrollmentType] = useState('initial')
  const [electsDental, setElectsDental] = useState(false)
  const [dentalTier, setDentalTier] = useState('employee_only')
  const [dentalRefusal, setDentalRefusal] = useState('')
  const [electsVision, setElectsVision] = useState(false)
  const [visionTier, setVisionTier] = useState('employee_only')
  const [visionRefusal, setVisionRefusal] = useState('')
  const [electsBasicLife, setElectsBasicLife] = useState(true)
  const [effectiveDate, setEffectiveDate] = useState('')

  useEffect(() => {
    fetch(`/api/benefits/life?employeeId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setEnrollmentType(data.enrollmentType ?? 'initial')
          setElectsDental(data.electsDental ?? false)
          setDentalTier(data.dentalCoverageTier ?? 'employee_only')
          setDentalRefusal(data.dentalRefusalReason ?? '')
          setElectsVision(data.electsVision ?? false)
          setVisionTier(data.visionCoverageTier ?? 'employee_only')
          setVisionRefusal(data.visionRefusalReason ?? '')
          setElectsBasicLife(data.electsBasicLife ?? true)
          setEffectiveDate(data.effectiveDate ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/benefits/life', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: id,
        enrollmentType,
        electsDental,
        dentalCoverageTier: electsDental ? dentalTier : null,
        dentalRefusalReason: !electsDental ? (dentalRefusal || null) : null,
        electsVision,
        visionCoverageTier: electsVision ? visionTier : null,
        visionRefusalReason: !electsVision ? (visionRefusal || null) : null,
        electsBasicLife,
        effectiveDate: effectiveDate || null,
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
        <h1 className="text-2xl font-semibold text-foreground">Life Insurance Enrollment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Guardian Group Plan 00483632</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enrollment type */}
        <div className="rounded-lg border border-border bg-card p-5">
          <label className={`${labelClass} mb-3`}>Enrollment Type</label>
          <div className="flex flex-wrap gap-2">
            {ENROLLMENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setEnrollmentType(t.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${
                  enrollmentType === t.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Life AD&D */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Basic Life AD&amp;D</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Amount determined by enrollment class (Owner / Manager / Employee)
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={electsBasicLife}
                onChange={(e) => setElectsBasicLife(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-foreground">Elect</span>
            </label>
          </div>
        </div>

        {/* Dental */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Dental — Guardian Voluntary Indemnity</h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
              <input
                type="checkbox"
                checked={electsDental}
                onChange={(e) => setElectsDental(e.target.checked)}
                className="rounded"
              />
              Elect dental
            </label>
          </div>
          <div className="p-5">
            {electsDental ? (
              <div className="space-y-2">
                {DENTAL_RATES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      dentalTier === t.value
                        ? 'border-primary bg-accent/50'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dentalTier"
                      value={t.value}
                      checked={dentalTier === t.value}
                      onChange={() => setDentalTier(t.value)}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.monthly}/mo · {t.percheck}/paycheck</span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <label className={labelClass}>Reason for declining dental</label>
                <textarea
                  value={dentalRefusal}
                  onChange={(e) => setDentalRefusal(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="e.g., Covered under spouse's plan…"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vision */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Vision — Guardian VSP Choice</h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
              <input
                type="checkbox"
                checked={electsVision}
                onChange={(e) => setElectsVision(e.target.checked)}
                className="rounded"
              />
              Elect vision
            </label>
          </div>
          <div className="p-5">
            {electsVision ? (
              <div className="space-y-2">
                {VISION_RATES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      visionTier === t.value
                        ? 'border-primary bg-accent/50'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visionTier"
                      value={t.value}
                      checked={visionTier === t.value}
                      onChange={() => setVisionTier(t.value)}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.monthly}/mo · {t.percheck}/paycheck</span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <label className={labelClass}>Reason for declining vision</label>
                <textarea
                  value={visionRefusal}
                  onChange={(e) => setVisionRefusal(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="e.g., Covered under spouse's plan…"
                />
              </div>
            )}
          </div>
        </div>

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

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Life insurance enrollment saved.
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
              onClick={() => router.push(`/benefits/${id}/beneficiaries`)}
              className="rounded-md px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Continue to Beneficiaries →
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
