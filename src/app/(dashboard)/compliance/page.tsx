import { db } from '@/lib/drizzle/db'
import { complianceAlerts, employees } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getAlerts() {
  return db
    .select({
      id: complianceAlerts.id,
      alertType: complianceAlerts.alertType,
      severity: complianceAlerts.severity,
      dueDate: complianceAlerts.dueDate,
      acknowledged: complianceAlerts.acknowledged,
      sentAt: complianceAlerts.sentAt,
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
    })
    .from(complianceAlerts)
    .leftJoin(employees, eq(complianceAlerts.employeeId, employees.id))
    .where(eq(complianceAlerts.acknowledged, false))
    .orderBy(complianceAlerts.severity, complianceAlerts.dueDate)
    .limit(100)
}

const severityConfig = {
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    rowClass: 'border-l-2 border-l-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    rowClass: 'border-l-2 border-l-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900',
  },
  info: {
    label: 'Info',
    icon: Info,
    rowClass: 'border-l-2 border-l-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900',
  },
}

const alertTypeLabels: Record<string, string> = {
  cdl_expiring: 'CDL expiring',
  medical_card_expiring: 'Medical card expiring',
  drug_test_due: 'Drug test due',
  violation_open: 'Open violation',
  document_missing: 'Document missing',
}

export default async function CompliancePage() {
  const alerts = await getAlerts()

  const critical = alerts.filter(a => a.severity === 'critical')
  const warning = alerts.filter(a => a.severity === 'warning')
  const info = alerts.filter(a => a.severity === 'info')

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">DOT Compliance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {alerts.length} active alerts requiring attention
          </p>
        </div>
        <form action="/api/compliance" method="POST">
          <button
            type="submit"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            Refresh alerts
          </button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Critical</span>
          </div>
          <p className="text-2xl font-semibold text-red-700 dark:text-red-400">{critical.length}</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Immediate action required</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Warning</span>
          </div>
          <p className="text-2xl font-semibold text-amber-700 dark:text-amber-400">{warning.length}</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">Expiring within 30–60 days</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">In compliance</span>
          </div>
          <p className="text-2xl font-semibold text-green-700 dark:text-green-400">
            {Math.max(0, 100 - alerts.length)}%
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">Estimated fleet compliance rate</p>
        </div>
      </div>

      {/* Alerts table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium text-foreground">Active alerts</h2>
        </div>
        <div className="divide-y divide-border bg-card">
          {alerts.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All drivers are in compliance.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const config = severityConfig[alert.severity as keyof typeof severityConfig]
              const Icon = config.icon
              return (
                <div key={alert.id} className={cn('flex items-center px-4 py-3 gap-4 hover:bg-muted/20 transition-colors', config.rowClass)}>
                  <Icon className={cn('h-4 w-4 shrink-0', {
                    'text-red-500': alert.severity === 'critical',
                    'text-amber-500': alert.severity === 'warning',
                    'text-blue-500': alert.severity === 'info',
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {alert.firstName} {alert.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{alert.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', config.badgeClass)}>
                      {alertTypeLabels[alert.alertType] ?? alert.alertType}
                    </span>
                    <span className="text-xs text-muted-foreground">Due {alert.dueDate}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
