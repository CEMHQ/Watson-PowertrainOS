import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/drizzle/db'
import { incidents, employees, vehicles, driverRiskScores } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import { ArrowLeft, Truck, User, MapPin, CalendarDays, FileText, TrendingDown } from 'lucide-react'
import { IncidentStatusUpdate } from '@/components/safety/IncidentStatusUpdate'

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

function riskScoreColor(score: number) {
  if (score >= 70) return 'text-red-600 dark:text-red-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

export default async function IncidentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [incidentRow] = await db
    .select({
      id:                incidents.id,
      incidentDate:      incidents.incidentDate,
      incidentType:      incidents.incidentType,
      severity:          incidents.severity,
      location:          incidents.location,
      description:       incidents.description,
      status:            incidents.status,
      investigatedBy:    incidents.investigatedBy,
      reportedAt:        incidents.reportedAt,
      employeeId:        incidents.employeeId,
      employeeFirstName: employees.firstName,
      employeeLastName:  employees.lastName,
      vehicleUnitNumber: vehicles.unitNumber,
      vehicleMake:       vehicles.make,
      vehicleModel:      vehicles.model,
    })
    .from(incidents)
    .leftJoin(employees, eq(incidents.employeeId, employees.id))
    .leftJoin(vehicles,  eq(incidents.vehicleId,  vehicles.id))
    .where(eq(incidents.id, params.id))

  if (!incidentRow) notFound()

  const [latestRiskScore] = await db
    .select({
      score:         driverRiskScores.score,
      factors:       driverRiskScores.factors,
      calculatedAt:  driverRiskScores.calculatedAt,
    })
    .from(driverRiskScores)
    .where(eq(driverRiskScores.employeeId, incidentRow.employeeId))
    .orderBy(desc(driverRiskScores.calculatedAt))
    .limit(1)

  const reportedDate = new Date(incidentRow.reportedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link
          href="/safety"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Incidents
        </Link>

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-foreground">
              {TYPE_LABELS[incidentRow.incidentType] ?? incidentRow.incidentType}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Reported {reportedDate}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
              severityClass(incidentRow.severity)
            )}>
              {SEVERITY_LABELS[incidentRow.severity] ?? incidentRow.severity}
            </span>
            <span className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
              statusClass(incidentRow.status)
            )}>
              {STATUS_LABELS[incidentRow.status] ?? incidentRow.status}
            </span>
          </div>
        </div>
      </div>

      {/* Incident details card */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {/* Section header */}
        <div className="px-5 py-3 bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Incident Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="px-5 py-4 space-y-4">
            {/* Employee */}
            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Employee</p>
                <p className="text-sm font-medium text-foreground">
                  {incidentRow.employeeFirstName} {incidentRow.employeeLastName}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-2.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Incident Date</p>
                <p className="text-sm font-medium text-foreground">{incidentRow.incidentDate}</p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-start gap-2.5">
              <Truck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <p className="text-sm font-medium text-foreground">
                  {incidentRow.vehicleUnitNumber
                    ? `Unit ${incidentRow.vehicleUnitNumber}${incidentRow.vehicleMake ? ` — ${incidentRow.vehicleMake} ${incidentRow.vehicleModel ?? ''}`.trimEnd() : ''}`
                    : 'None'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Location */}
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">{incidentRow.location}</p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-start gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium text-foreground">
                  {TYPE_LABELS[incidentRow.incidentType] ?? incidentRow.incidentType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground mb-1.5">Description</p>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {incidentRow.description}
          </p>
        </div>
      </div>

      {/* Status update */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-5 py-3 bg-muted/30 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Update Status</h2>
        </div>
        <div className="px-5 py-4">
          <IncidentStatusUpdate
            incidentId={incidentRow.id}
            currentStatus={incidentRow.status as 'open' | 'under_investigation' | 'resolved' | 'closed'}
          />
          {incidentRow.status === 'closed' && (
            <p className="text-xs text-muted-foreground">This incident is closed and cannot be updated.</p>
          )}
        </div>
      </div>

      {/* Driver risk score */}
      {latestRiskScore && (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-3 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Driver Risk Score</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className={cn('text-3xl font-bold', riskScoreColor(Number(latestRiskScore.score)))}>
                {Number(latestRiskScore.score).toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
              <span className="text-xs text-muted-foreground ml-1">
                as of {new Date(latestRiskScore.calculatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {latestRiskScore.factors != null && typeof latestRiskScore.factors === 'object' && (
              <div className="space-y-1">
                {Object.entries(latestRiskScore.factors as Record<string, string | number>).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-foreground font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
