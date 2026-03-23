import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { incidents, employees, vehicles } from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const incidentSchema = z.object({
  employeeId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  incidentType: z.enum(['accident', 'near_miss', 'property_damage', 'injury', 'violation']),
  severity: z.enum(['minor', 'moderate', 'major', 'fatality']),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const incidentType = searchParams.get('type')

    const conditions = []
    if (status)       conditions.push(eq(incidents.status,       status       as 'open' | 'under_investigation' | 'resolved' | 'closed'))
    if (severity)     conditions.push(eq(incidents.severity,     severity     as 'minor' | 'moderate' | 'major' | 'fatality'))
    if (incidentType) conditions.push(eq(incidents.incidentType, incidentType as 'accident' | 'near_miss' | 'property_damage' | 'injury' | 'violation'))

    const data = await db
      .select({
        id:                  incidents.id,
        incidentDate:        incidents.incidentDate,
        incidentType:        incidents.incidentType,
        severity:            incidents.severity,
        location:            incidents.location,
        status:              incidents.status,
        reportedAt:          incidents.reportedAt,
        employeeFirstName:   employees.firstName,
        employeeLastName:    employees.lastName,
        vehicleUnitNumber:   vehicles.unitNumber,
      })
      .from(incidents)
      .leftJoin(employees, eq(incidents.employeeId, employees.id))
      .leftJoin(vehicles,  eq(incidents.vehicleId,  vehicles.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(incidents.reportedAt))
      .limit(100)

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/safety]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()

    const parsed = incidentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { vehicleId, ...rest } = parsed.data

    const [incident] = await db
      .insert(incidents)
      .values({ ...rest, vehicleId: vehicleId ?? null })
      .returning()

    // TODO (Phase 3): Fire n8n webhook — incident.created → notify safety manager
    // await fetch(process.env.N8N_WEBHOOK_URL!, {
    //   method: 'POST',
    //   body: JSON.stringify({ type: 'incident.created', payload: incident }),
    // })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/safety]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
