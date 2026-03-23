import Link from 'next/link'
import { db } from '@/lib/drizzle/db'
import { incidents, employees, vehicles } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { AlertTriangle, ShieldAlert, Clock, CheckCircle2, Plus, Truck, FileWarning } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  accident:        'Accident',
  near_miss:       'Near Miss',
  property_damage: 'Property Damage',
  injury:          'Injury',
  violation:       'Violation',
}

const SEVERITY_LABELS: Record<string, string> = {
  minor:    'Minor',
  moderate: 'Moderate',
  major:    'Major',
  fatality: 'Fatality',
}

const STATUS_LABELS: Record<string, string> = {
  open:                'Open',
  under_investigation: 'Under Investigation',
  resolved:            'Resolved',
  closed:              'Closed',
}

function severityClass(severity: string) {
  if (severity === 'fatality' || severity === 'major') return 'severity-critical'
  if (severity === 'moderate') return 'severity-warning'
  return 'border-border text-muted-foreground bg-muted/30'
}

function statusClass(status: string) {
  if (status === 'open') return 'severity-warning'
  if (status === 'under_investigation')
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900'
  if (status === 'resolved' || status === 'closed') return 'severity-good'
  return 'border-border text-muted-foreground bg-muted/30'
}

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: { status?: string; severity?: string; type?: string }
}) {
  const conditions = []
  if (searchParams.status)
    conditions.push(eq(incidents.status, searchParams.status as 'open' | 'under_investigation' | 'resolved' | 'closed'))
  if (searchParams.severity)
    conditions.push(eq(incidents.severity, searchParams.severity as 'minor' | 'moderate' | 'major' | 'fatality'))
  if (searchParams.type)
    conditions.push(eq(incidents.incidentType, searchParams.type as 'accident' | 'near_miss' | 'property_damage' | 'injury' | 'violation'))

  const [incidentList, openRow, criticalRow, investigatingRow, resolvedRow] = await Promise.all([
    db
      .select({
        id:                incidents.id,
        incidentDate:      incidents.incidentDate,
        incidentType:      incidents.incidentType,
        severity:          incidents.severity,
        location:          incidents.location,
        status:            incidents.status,
        employeeFirstName: employees.firstName,
        employeeLastName:  employees.lastName,
        vehicleUnitNumber: vehicles.unitNumber,
      })
      .from(incidents)
      .leftJoin(employees, eq(incidents.employeeId, employees.id))
      .leftJoin(vehicles,  eq(incidents.vehicleId,  vehicles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(incidents.reportedAt))
      .limit(100),

    db.select({ n: sql<number>`count(*)::int` }).from(incidents)
      .where(eq(incidents.status, 'open')),

    db.select({ n: sql<number>`count(*)::int` }).from(incidents)
      .where(and(
        eq(incidents.status, 'open'),
        sql`${incidents.severity} in ('major','fatality')`
      )),

    db.select({ n: sql<number>`count(*)::int` }).from(incidents)
      .where(eq(incidents.status, 'under_investigation')),

    db.select({ n: sql<number>`count(*)::int` }).from(incidents)
      .where(sql`${incidents.status} in ('resolved','closed')`),
  ])

  const stats = [
    { label: 'Open',               value: openRow[0]?.n         ?? 0, Icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-950/50', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Critical Open',      value: criticalRow[0]?.n     ?? 0, Icon: ShieldAlert,   bg: 'bg-red-50 dark:bg-red-950/50',    color: 'text-red-600 dark:text-red-400'     },
    { label: 'Under Investigation', value: investigatingRow[0]?.n ?? 0, Icon: Clock,         bg: 'bg-blue-50 dark:bg-blue-950/50',  color: 'text-blue-600 dark:text-blue-400'   },
    { label: 'Resolved / Closed',  value: resolvedRow[0]?.n     ?? 0, Icon: CheckCircle2,  bg: 'bg-green-50 dark:bg-green-950/50', color: 'text-green-600 dark:text-green-400' },
  ]

  const hasFilters = searchParams.status || searchParams.severity || searchParams.type

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Safety &amp; Incidents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track incidents, investigations, and driver safety performance
          </p>
        </div>
        <Link
          href="/safety/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Report Incident
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, bg, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-md p-2', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-center">
        <select
          name="type"
          defaultValue={searchParams.type ?? ''}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          name="severity"
          defaultValue={searchParams.severity ?? ''}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Severities</option>
          {Object.entries(SEVERITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Filter
        </button>

        {hasFilters && (
          <Link
            href="/safety"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Incident table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {incidentList.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <FileWarning className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No incidents found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasFilters ? 'Try adjusting your filters' : 'Report an incident to get started'}
              </p>
            </div>
            {!hasFilters && (
              <Link
                href="/safety/new"
                className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Report First Incident
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {incidentList.map((incident) => (
                <tr key={incident.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/safety/${incident.id}`}
                      className="text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {incident.incidentDate}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {incident.employeeFirstName} {incident.employeeLastName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {TYPE_LABELS[incident.incidentType] ?? incident.incidentType}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      severityClass(incident.severity)
                    )}>
                      {SEVERITY_LABELS[incident.severity] ?? incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                    {incident.location}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {incident.vehicleUnitNumber ? (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {incident.vehicleUnitNumber}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      statusClass(incident.status)
                    )}>
                      {STATUS_LABELS[incident.status] ?? incident.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
