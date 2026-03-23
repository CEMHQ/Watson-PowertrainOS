'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface Vehicle {
  id: string
  unitNumber: string
  make: string | null
  model: string | null
}

interface Props {
  employees: Employee[]
  vehicles: Vehicle[]
}

const today = new Date().toISOString().split('T')[0]

export function NewIncidentForm({ employees, vehicles }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      employeeId:   form.get('employeeId'),
      vehicleId:    form.get('vehicleId') || undefined,
      incidentDate: form.get('incidentDate'),
      incidentType: form.get('incidentType'),
      severity:     form.get('severity'),
      location:     form.get('location'),
      description:  form.get('description'),
    }

    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to submit incident report')
      setSubmitting(false)
      return
    }

    const incident = await res.json()
    router.push(`/safety/${incident.id}`)
  }

  const inputClass =
    'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Employee */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Employee Involved <span className="text-red-500">*</span>
        </label>
        <select name="employeeId" required className={inputClass}>
          <option value="">Select employee…</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Vehicle (optional)
        </label>
        <select name="vehicleId" className={inputClass}>
          <option value="">No vehicle involved</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              Unit {v.unitNumber}{v.make ? ` — ${v.make} ${v.model ?? ''}`.trimEnd() : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Incident date */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Incident Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="incidentDate"
          defaultValue={today}
          max={today}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select name="incidentType" required className={inputClass}>
            <option value="">Select type…</option>
            <option value="accident">Accident</option>
            <option value="near_miss">Near Miss</option>
            <option value="property_damage">Property Damage</option>
            <option value="injury">Injury</option>
            <option value="violation">Violation</option>
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Severity <span className="text-red-500">*</span>
          </label>
          <select name="severity" required className={inputClass}>
            <option value="">Select severity…</option>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="major">Major</option>
            <option value="fatality">Fatality</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          required
          placeholder="e.g. US-62 near Hobbs, NM mile marker 14"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Describe what happened, conditions, and any immediate actions taken…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 dark:text-red-400 dark:bg-red-950 dark:border-red-900">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit Incident Report'}
        </button>

        <a
          href="/safety"
          className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
