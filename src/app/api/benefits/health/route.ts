import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { groupHealthEnrollments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const healthSchema = z.object({
  employeeId: z.string().uuid(),
  healthPlan: z.enum(['none', 'mec', 'standard', 'buy_up']),
  coverageTier: z.enum(['employee_only', 'employee_spouse', 'employee_children', 'employee_family']).nullable().optional(),
  refusalReason: z.string().nullable().optional(),
  authorizedPerson1Name: z.string().nullable().optional(),
  authorizedPerson1Phone: z.string().nullable().optional(),
  authorizedPerson2Name: z.string().nullable().optional(),
  authorizedPerson2Phone: z.string().nullable().optional(),
  authorizedPerson3Name: z.string().nullable().optional(),
  authorizedPerson3Phone: z.string().nullable().optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    if (!employeeId) return NextResponse.json({ error: 'employeeId required' }, { status: 400 })

    const [enrollment] = await db
      .select()
      .from(groupHealthEnrollments)
      .where(eq(groupHealthEnrollments.employeeId, employeeId))

    return NextResponse.json(enrollment ?? null)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[GET /api/benefits/health]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const parsed = healthSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

    // Check for existing record
    const [existing] = await db
      .select({ id: groupHealthEnrollments.id })
      .from(groupHealthEnrollments)
      .where(eq(groupHealthEnrollments.employeeId, parsed.data.employeeId))

    if (existing) {
      const [updated] = await db
        .update(groupHealthEnrollments)
        .set({ ...parsed.data, employeeSignedAt: new Date(), updatedAt: new Date() })
        .where(eq(groupHealthEnrollments.employeeId, parsed.data.employeeId))
        .returning()
      return NextResponse.json(updated)
    }

    const [enrollment] = await db
      .insert(groupHealthEnrollments)
      .values({ ...parsed.data, employeeSignedAt: new Date() })
      .returning()

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[POST /api/benefits/health]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
