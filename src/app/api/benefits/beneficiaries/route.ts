import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { beneficiaries } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const beneficiarySchema = z.object({
  employeeId: z.string().uuid(),
  beneficiaryType: z.enum(['primary', 'contingent']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.string().min(1),
  percentage: z.string().regex(/^\d+(\.\d{1,2})?$/),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    if (!employeeId) return NextResponse.json({ error: 'employeeId required' }, { status: 400 })

    const rows = await db
      .select()
      .from(beneficiaries)
      .where(eq(beneficiaries.employeeId, employeeId))
      .orderBy(beneficiaries.beneficiaryType, beneficiaries.createdAt)

    return NextResponse.json(rows)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[GET /api/benefits/beneficiaries]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const parsed = beneficiarySchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

    const [beneficiary] = await db.insert(beneficiaries).values(parsed.data).returning()
    return NextResponse.json(beneficiary, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[POST /api/benefits/beneficiaries]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
