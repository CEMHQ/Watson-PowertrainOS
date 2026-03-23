import { createSupabaseServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { employees, complianceAlerts, incidents } from '@/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { Users, AlertTriangle, Shield, TrendingUp } from 'lucide-react'

async function getDashboardStats() {
  const [
    totalEmployees,
    activeAlerts,
    criticalAlerts,
    openIncidents,
  ] = await Promise.all([
    db.select({ count: count() }).from(employees).where(eq(employees.status, 'active')),
    db.select({ count: count() }).from(complianceAlerts).where(eq(complianceAlerts.acknowledged, false)),
    db.select({ count: count() }).from(complianceAlerts).where(
      and(eq(complianceAlerts.severity, 'critical'), eq(complianceAlerts.acknowledged, false))
    ),
    db.select({ count: count() }).from(incidents).where(eq(incidents.status, 'open')),
  ])

  return {
    totalEmployees: totalEmployees[0]?.count ?? 0,
    activeAlerts: activeAlerts[0]?.count ?? 0,
    criticalAlerts: criticalAlerts[0]?.count ?? 0,
    openIncidents: openIncidents[0]?.count ?? 0,
  }
}

const statCards = [
  {
    key: 'totalEmployees',
    label: 'Active employees',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    key: 'activeAlerts',
    label: 'Compliance alerts',
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    key: 'criticalAlerts',
    label: 'Critical alerts',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950',
  },
  {
    key: 'openIncidents',
    label: 'Open incidents',
    icon: TrendingUp,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
]

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fleet workforce & compliance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className={`rounded-md p-1.5 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {stats[key as keyof typeof stats].toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground mb-3">Critical compliance alerts</h2>
          <p className="text-sm text-muted-foreground">
            {stats.criticalAlerts === 0
              ? 'No critical alerts — all drivers in good standing.'
              : `${stats.criticalAlerts} driver${stats.criticalAlerts !== 1 ? 's' : ''} require immediate attention.`}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground mb-3">Recent incidents</h2>
          <p className="text-sm text-muted-foreground">
            {stats.openIncidents === 0
              ? 'No open incidents.'
              : `${stats.openIncidents} incident${stats.openIncidents !== 1 ? 's' : ''} currently open.`}
          </p>
        </div>
      </div>
    </div>
  )
}
