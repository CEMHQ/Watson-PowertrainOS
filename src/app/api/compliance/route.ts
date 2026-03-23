import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/db'
import { complianceAlerts, employees, cdlCertifications, medicalCards } from '@/db/schema'
import { eq, and, lte, gte, desc } from 'drizzle-orm'
import { requireServerUser } from '@/lib/supabase/server'
import { addDays, format } from 'date-fns'

// GET /api/compliance/alerts
// Returns active alerts sorted by severity and due date
export async function GET(request: NextRequest) {
  try {
    await requireServerUser()

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const acknowledged = searchParams.get('acknowledged')

    const conditions = []
    if (severity) conditions.push(eq(complianceAlerts.severity, severity as any))
    if (acknowledged !== null) {
      conditions.push(eq(complianceAlerts.acknowledged, acknowledged === 'true'))
    }

    const alerts = await db
      .select({
        alert: complianceAlerts,
        employeeFirstName: employees.firstName,
        employeeLastName: employees.lastName,
        employeeEmail: employees.email,
      })
      .from(complianceAlerts)
      .leftJoin(employees, eq(complianceAlerts.employeeId, employees.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(complianceAlerts.severity), complianceAlerts.dueDate)

    return NextResponse.json({ data: alerts })
  } catch (error) {
    console.error('[GET /api/compliance/alerts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/compliance/alerts/generate
// Scans all employees and auto-generates alerts for expiring docs
export async function POST(request: NextRequest) {
  try {
    await requireServerUser()

    const today = new Date()
    const in30Days = addDays(today, 30)
    const in60Days = addDays(today, 60)

    const todayStr = format(today, 'yyyy-MM-dd')
    const in30Str = format(in30Days, 'yyyy-MM-dd')
    const in60Str = format(in60Days, 'yyyy-MM-dd')

    // Find expiring CDLs
    const expiringCDLs = await db
      .select({ employeeId: cdlCertifications.employeeId, expirationDate: cdlCertifications.expirationDate })
      .from(cdlCertifications)
      .where(and(
        lte(cdlCertifications.expirationDate, in60Str),
        gte(cdlCertifications.expirationDate, todayStr)
      ))

    // Find expiring medical cards
    const expiringMedCards = await db
      .select({ employeeId: medicalCards.employeeId, expirationDate: medicalCards.expirationDate })
      .from(medicalCards)
      .where(and(
        lte(medicalCards.expirationDate, in60Str),
        gte(medicalCards.expirationDate, todayStr)
      ))

    const alertsToCreate = [
      ...expiringCDLs.map(cdl => ({
        employeeId: cdl.employeeId,
        alertType: 'cdl_expiring' as const,
        severity: cdl.expirationDate <= in30Str ? 'critical' as const : 'warning' as const,
        dueDate: cdl.expirationDate,
        acknowledged: false,
      })),
      ...expiringMedCards.map(card => ({
        employeeId: card.employeeId,
        alertType: 'medical_card_expiring' as const,
        severity: card.expirationDate <= in30Str ? 'critical' as const : 'warning' as const,
        dueDate: card.expirationDate,
        acknowledged: false,
      })),
    ]

    if (alertsToCreate.length > 0) {
      await db.insert(complianceAlerts).values(alertsToCreate).onConflictDoNothing()
    }

    return NextResponse.json({
      generated: alertsToCreate.length,
      cdlAlerts: expiringCDLs.length,
      medCardAlerts: expiringMedCards.length,
    })
  } catch (error) {
    console.error('[POST /api/compliance/alerts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
