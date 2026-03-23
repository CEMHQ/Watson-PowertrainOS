import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { familyMembers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  gender: z.string().nullable().optional(),
  relationship: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  employerName: z.string().nullable().optional(),
  employerAddress: z.string().nullable().optional(),
  employerPhone: z.string().nullable().optional(),
  isStudent: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  hasOtherMedical: z.boolean().optional(),
  hasOtherDental: z.boolean().optional(),
  hasOtherVision: z.boolean().optional(),
  otherInsuranceCarrier: z.string().nullable().optional(),
  otherInsurancePolicyNumber: z.string().nullable().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

    const [updated] = await db
      .update(familyMembers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(familyMembers.id, params.memberId))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[PUT /api/benefits/family/[memberId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const [deleted] = await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, params.memberId))
      .returning()

    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[DELETE /api/benefits/family/[memberId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
