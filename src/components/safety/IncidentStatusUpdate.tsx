'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type IncidentStatus = 'open' | 'under_investigation' | 'resolved' | 'closed'

interface Props {
  incidentId: string
  currentStatus: IncidentStatus
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  open:                'Open',
  under_investigation: 'Under Investigation',
  resolved:            'Resolved',
  closed:              'Closed',
}

// Valid forward progressions only
const NEXT_STATUSES: Record<IncidentStatus, IncidentStatus[]> = {
  open:                ['under_investigation', 'resolved', 'closed'],
  under_investigation: ['resolved', 'closed'],
  resolved:            ['closed'],
  closed:              [],
}

export function IncidentStatusUpdate({ incidentId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<IncidentStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const nextOptions = NEXT_STATUSES[currentStatus]
  if (nextOptions.length === 0) return null

  const handleSave = async () => {
    if (status === currentStatus) return
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch(`/api/safety/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to update status')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as IncidentStatus); setSaved(false) }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value={currentStatus}>{STATUS_LABELS[currentStatus]} (current)</option>
          {nextOptions.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <button
          onClick={handleSave}
          disabled={saving || status === currentStatus}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>

      {saved && (
        <p className="text-xs text-green-700 dark:text-green-400">Status updated successfully.</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
