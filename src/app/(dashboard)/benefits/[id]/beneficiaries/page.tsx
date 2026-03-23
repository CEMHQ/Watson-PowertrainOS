'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'

const inputClass =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

interface Beneficiary {
  id: string
  beneficiaryType: 'primary' | 'contingent'
  firstName: string
  lastName: string
  relationship: string
  percentage: string
  dateOfBirth: string | null
  phone: string | null
}

function BeneficiaryRow({ b, onDelete }: { b: Beneficiary; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/benefits/beneficiaries/${b.id}`, { method: 'DELETE' })
    onDelete(b.id)
  }
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">
          {b.firstName} {b.lastName}
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {b.relationship} · {Number(b.percentage).toFixed(0)}%
          </span>
        </p>
        {b.dateOfBirth && (
          <p className="text-xs text-muted-foreground">DOB {b.dateOfBirth}</p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

function AddBeneficiaryForm({
  employeeId,
  type,
  onAdded,
  onCancel,
}: {
  employeeId: string
  type: 'primary' | 'contingent'
  onAdded: (b: Beneficiary) => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/benefits/beneficiaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId,
        beneficiaryType: type,
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        relationship: fd.get('relationship'),
        percentage: fd.get('percentage'),
        dateOfBirth: fd.get('dateOfBirth') || null,
        phone: fd.get('phone') || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to add beneficiary')
      setSaving(false)
      return
    }
    onAdded(await res.json())
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground capitalize">Add {type} Beneficiary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
          <input name="firstName" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
          <input name="lastName" required className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Relationship <span className="text-red-500">*</span></label>
          <select name="relationship" required className={inputClass}>
            <option value="">Select…</option>
            {['Spouse','Child','Parent','Sibling','Estate','Trust','Other'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Percentage <span className="text-red-500">*</span></label>
          <input name="percentage" required type="number" min="1" max="100" step="0.01" className={inputClass} placeholder="e.g. 50" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input name="dateOfBirth" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" className={inputClass} placeholder="575-000-0000" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : 'Add Beneficiary'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function BeneficiariesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [beneficiaryList, setBeneficiaryList] = useState<Beneficiary[]>([])
  const [adding, setAdding] = useState<'primary' | 'contingent' | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/benefits/beneficiaries?employeeId=${id}`)
    if (res.ok) setBeneficiaryList(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const primary = beneficiaryList.filter((b) => b.beneficiaryType === 'primary')
  const contingent = beneficiaryList.filter((b) => b.beneficiaryType === 'contingent')

  const primaryPct = primary.reduce((sum, b) => sum + Number(b.percentage), 0)
  const contingentPct = contingent.reduce((sum, b) => sum + Number(b.percentage), 0)

  const handleAdded = (b: Beneficiary) => {
    setBeneficiaryList((prev) => [...prev, b])
    setAdding(null)
  }
  const handleDeleted = (id: string) => setBeneficiaryList((prev) => prev.filter((b) => b.id !== id))

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <Link href={`/benefits/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Enrollment Hub
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Beneficiary Designations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Guardian Life Insurance — Group Plan 00483632</p>
      </div>

      {/* Primary */}
      <section>
        <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Primary Beneficiaries</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Must total 100%</p>
          </div>
          <span className={`text-sm font-semibold ${Math.abs(primaryPct - 100) < 0.01 && primary.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {primaryPct.toFixed(0)}%
          </span>
        </div>
        <div className="space-y-3">
          {primary.map((b) => <BeneficiaryRow key={b.id} b={b} onDelete={handleDeleted} />)}
        </div>
        {primaryPct > 100 && (
          <div className="flex items-center gap-2 mt-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Primary beneficiary percentages exceed 100%
          </div>
        )}
        {adding === 'primary' ? (
          <div className="mt-3">
            <AddBeneficiaryForm employeeId={id} type="primary" onAdded={handleAdded} onCancel={() => setAdding(null)} />
          </div>
        ) : (
          <button
            onClick={() => setAdding('primary')}
            className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors w-full"
          >
            <Plus className="h-4 w-4" />
            Add primary beneficiary
          </button>
        )}
      </section>

      {/* Contingent */}
      <section>
        <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Contingent Beneficiaries</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Receives benefits if all primary beneficiaries predecease</p>
          </div>
          {contingent.length > 0 && (
            <span className={`text-sm font-semibold ${Math.abs(contingentPct - 100) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {contingentPct.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="space-y-3">
          {contingent.map((b) => <BeneficiaryRow key={b.id} b={b} onDelete={handleDeleted} />)}
        </div>
        {adding === 'contingent' ? (
          <div className="mt-3">
            <AddBeneficiaryForm employeeId={id} type="contingent" onAdded={handleAdded} onCancel={() => setAdding(null)} />
          </div>
        ) : (
          <button
            onClick={() => setAdding('contingent')}
            className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors w-full"
          >
            <Plus className="h-4 w-4" />
            Add contingent beneficiary
          </button>
        )}
      </section>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(`/benefits/${id}/salary-redirection`)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Continue to Salary Redirection →
        </button>
      </div>
    </div>
  )
}
