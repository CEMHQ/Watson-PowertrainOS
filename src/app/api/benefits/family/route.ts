import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { familyMembers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const familyMemberSchema = z.object({
  employeeId: z.string().uuid(),
  memberType: z.enum(['spouse', 'dependent']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  employerName: z.string().optional().nullable(),
  employerAddress: z.string().optional().nullable(),
  employerPhone: z.string().optional().nullable(),
  isStudent: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  hasOtherMedical: z.boolean().optional(),
  hasOtherDental: z.boolean().optional(),
  hasOtherVision: z.boolean().optional(),
  otherInsuranceCarrier: z.string().optional().nullable(),
  otherInsurancePolicyNumber: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    if (!employeeId) return NextResponse.json({ error: 'employeeId required' }, { status: 400 })

    const members = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.employeeId, employeeId))
      .orderBy(familyMembers.memberType, familyMembers.createdAt)

    return NextResponse.json(members)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[GET /api/benefits/family]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const parsed = familyMemberSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

    const [member] = await db.insert(familyMembers).values(parsed.data).returning()
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[POST /api/benefits/family]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
