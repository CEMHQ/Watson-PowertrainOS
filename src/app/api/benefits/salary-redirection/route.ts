import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle/db'
import { deductions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const deductionAmount = z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional()

const deductionSchema = z.object({
  employeeId: z.string().uuid(),
  medicalPreTax: z.boolean().optional(),
  medicalAmount: deductionAmount,
  dentalPreTax: z.boolean().optional(),
  dentalAmount: deductionAmount,
  visionPreTax: z.boolean().optional(),
  visionAmount: deductionAmount,
  accidentPreTax: z.boolean().optional(),
  accidentAmount: deductionAmount,
  cancerPreTax: z.boolean().optional(),
  cancerAmount: deductionAmount,
  stdPreTax: z.boolean().optional(),
  stdAmount: deductionAmount,
  hospitalPreTax: z.boolean().optional(),
  hospitalAmount: deductionAmount,
  termLifePreTax: z.boolean().optional(),
  termLifeAmount: deductionAmount,
  wholeLifePreTax: z.boolean().optional(),
  wholeLifeAmount: deductionAmount,
  otherPreTax: z.boolean().optional(),
  otherAmount: deductionAmount,
  otherDescription: z.string().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const employeeId = request.nextUrl.searchParams.get('employeeId')
    if (!employeeId) return NextResponse.json({ error: 'employeeId required' }, { status: 400 })

    const [record] = await db
      .select()
      .from(deductions)
      .where(eq(deductions.employeeId, employeeId))

    return NextResponse.json(record ?? null)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[GET /api/benefits/salary-redirection]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    await requireServerUser()
    const parsed = deductionSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

    const [existing] = await db
      .select({ id: deductions.id })
      .from(deductions)
      .where(eq(deductions.employeeId, parsed.data.employeeId))

    if (existing) {
      const [updated] = await db
        .update(deductions)
        .set({ ...parsed.data, employeeSignedAt: new Date(), updatedAt: new Date() })
        .where(eq(deductions.employeeId, parsed.data.employeeId))
        .returning()
      return NextResponse.json(updated)
    }

    const [record] = await db
      .insert(deductions)
      .values({ ...parsed.data, employeeSignedAt: new Date() })
      .returning()

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[POST /api/benefits/salary-redirection]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
