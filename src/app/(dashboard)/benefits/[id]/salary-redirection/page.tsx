'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const inputClass =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

const CATEGORIES = [
  { key: 'medical',   label: 'Medical',              provider: 'Insurance Management Services' },
  { key: 'dental',    label: 'Dental',               provider: 'Guardian Life Insurance'       },
  { key: 'vision',    label: 'Vision',               provider: 'Guardian Life Insurance'       },
  { key: 'accident',  label: 'Accident',             provider: 'Guardian Life Insurance'       },
  { key: 'cancer',    label: 'Cancer',               provider: 'Guardian Life Insurance'       },
  { key: 'std',       label: 'Short-Term Disability', provider: 'Guardian Life Insurance'      },
  { key: 'hospital',  label: 'Hospital',             provider: 'Guardian Life Insurance'       },
  { key: 'termLife',  label: 'Term Life',            provider: 'Guardian Life Insurance'       },
  { key: 'wholeLife', label: 'Whole Life',           provider: 'Guardian Life Insurance'       },
  { key: 'other',     label: 'Other',                provider: ''                              },
] as const

type CategoryKey = (typeof CATEGORIES)[number]['key']

interface Row {
  preTax: boolean
  amount: string
}

type Rows = Record<CategoryKey, Row>

const defaultRows = (): Rows =>
  Object.fromEntries(
    CATEGORIES.map(({ key }) => [key, { preTax: true, amount: '' }])
  ) as Rows

export default function SalaryRedirectionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rows, setRows] = useState<Rows>(defaultRows())
  const [otherDescription, setOtherDescription] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')

  useEffect(() => {
    fetch(`/api/benefits/salary-redirection?employeeId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const updated = defaultRows()
          for (const { key } of CATEGORIES) {
            const preTaxKey = `${key}PreTax` as keyof typeof data
            const amountKey = `${key}Amount` as keyof typeof data
            updated[key] = {
              preTax: data[preTaxKey] ?? true,
              amount: data[amountKey] ?? '',
            }
          }
          setRows(updated)
          setOtherDescription(data.otherDescription ?? '')
          setEffectiveDate(data.effectiveDate ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const setRow = (key: CategoryKey, patch: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const preTaxTotal = CATEGORIES.reduce((sum, { key }) => {
    const r = rows[key]
    return r.preTax && r.amount ? sum + parseFloat(r.amount) : sum
  }, 0)

  const postTaxTotal = CATEGORIES.reduce((sum, { key }) => {
    const r = rows[key]
    return !r.preTax && r.amount ? sum + parseFloat(r.amount) : sum
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const body: Record<string, unknown> = { employeeId: id, otherDescription: otherDescription || null }
    for (const { key } of CATEGORIES) {
      body[`${key}PreTax`] = rows[key].preTax
      body[`${key}Amount`] = rows[key].amount || null
    }

    const res = await fetch('/api/benefits/salary-redirection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save')
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
        <span className="text-sm">Loading…</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <Link
          href={`/benefits/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Enrollment Hub
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Salary Redirection Agreement</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Watson Truck &amp; Supply, Inc. — Cafeteria Plan Year 1/1/2019 – 12/31/2019
        </p>
      </div>

      {/* Legal header */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-xs text-muted-foreground leading-relaxed">
        On a separate benefit enrollment form(s), I have enrolled for certain insurance coverage(s) and understand
        that my insurance premiums election amount will be deducted from my paycheck by my employer on a pre-tax
        or post-tax basis as indicated below. I understand that this agreement shall remain in effect for the entire
        plan year unless I have a qualifying change in status event as defined under Section 125 of the Internal
        Revenue Code.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deduction table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 bg-muted/30 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Insurance Premium Elections</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select pre-tax or post-tax and enter per-paycheck premium amount</p>
          </div>
          <div className="divide-y divide-border">
            {CATEGORIES.map(({ key, label, provider }) => (
              <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  {provider && <p className="text-xs text-muted-foreground">{provider}</p>}
                  {key === 'other' && (
                    <input
                      value={otherDescription}
                      onChange={(e) => setOtherDescription(e.target.value)}
                      className="mt-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48"
                      placeholder="Description…"
                    />
                  )}
                </div>
                {/* Pre/Post toggle */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium shrink-0">
                  <button
                    type="button"
                    onClick={() => setRow(key, { preTax: true })}
                    className={`px-3 py-1.5 transition-colors ${
                      rows[key].preTax
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    Pre-Tax
                  </button>
                  <button
                    type="button"
                    onClick={() => setRow(key, { preTax: false })}
                    className={`px-3 py-1.5 border-l border-border transition-colors ${
                      !rows[key].preTax
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    Post-Tax
                  </button>
                </div>
                {/* Amount */}
                <div className="relative shrink-0 w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rows[key].amount}
                    onChange={(e) => setRow(key, { amount: e.target.value })}
                    className="rounded-md border border-border bg-background pl-6 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center gap-8">
            <div>
              <span className="text-xs text-muted-foreground">Total Pre-Tax</span>
              <p className="text-sm font-semibold text-foreground">${preTaxTotal.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/paycheck</span></p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total Post-Tax</span>
              <p className="text-sm font-semibold text-foreground">${postTaxTotal.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/paycheck</span></p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-muted-foreground">Grand Total</span>
              <p className="text-sm font-semibold text-foreground">${(preTaxTotal + postTaxTotal).toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/paycheck</span></p>
            </div>
          </div>
        </div>

        {/* Acknowledgements */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Employee Acknowledgements</h2>
          <div className="space-y-3 text-xs text-muted-foreground">
            {[
              'On or after the first day of the plan year, I cannot change or revoke this Salary Redirection Agreement except upon the occurrence of a qualifying change in status event.',
              'Execution of this Salary Redirection Agreement does not begin coverage under the component benefit plans. Separate enrollment forms must be completed to begin coverage.',
              'I hereby specifically authorize those parties to use my personal information in connection with the administration of the benefit plan.',
              'Paying for coverage on a pre-tax basis may cause insurance claim payments to be subject to federal and state taxes under certain circumstances.',
              'I certify that the features and benefits under the Benefits Plan have been explained to me and I understand my rights and obligations under the plan.',
            ].map((text, i) => (
              <div key={i} className="flex gap-3 items-start leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{i + 1}</span>
                <p>{text}</p>
              </div>
            ))}
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
            Salary redirection agreement saved.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Agreement'}
          </button>
          {saved && (
            <button
              type="button"
              onClick={() => router.push(`/benefits/${id}`)}
              className="rounded-md px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Back to Enrollment Hub →
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
