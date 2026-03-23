import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { incidents, employees, vehicles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['open', 'under_investigation', 'resolved', 'closed']).optional(),
  investigatedBy: z.string().uuid().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()

    const [incident] = await db
      .select({
        id:                  incidents.id,
        employeeId:          incidents.employeeId,
        vehicleId:           incidents.vehicleId,
        incidentDate:        incidents.incidentDate,
        incidentType:        incidents.incidentType,
        severity:            incidents.severity,
        location:            incidents.location,
        description:         incidents.description,
        status:              incidents.status,
        investigatedBy:      incidents.investigatedBy,
        reportedAt:          incidents.reportedAt,
        employeeFirstName:   employees.firstName,
        employeeLastName:    employees.lastName,
        vehicleUnitNumber:   vehicles.unitNumber,
        vehicleMake:         vehicles.make,
        vehicleModel:        vehicles.model,
      })
      .from(incidents)
      .leftJoin(employees, eq(incidents.employeeId, employees.id))
      .leftJoin(vehicles,  eq(incidents.vehicleId,  vehicles.id))
      .where(eq(incidents.id, params.id))

    if (!incident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(incident)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/safety/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()

    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateFields: Partial<typeof incidents.$inferInsert> = {}
    if (parsed.data.status       !== undefined) updateFields.status       = parsed.data.status
    if (parsed.data.investigatedBy !== undefined) updateFields.investigatedBy = parsed.data.investigatedBy ?? null

    const [updated] = await db
      .update(incidents)
      .set(updateFields)
      .where(eq(incidents.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/safety/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
