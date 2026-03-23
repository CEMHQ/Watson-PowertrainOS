import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { requireServerUser } from '@/lib/supabase/server'
import { z } from 'zod'

// TODO (Phase 2): Add employee_benefits and benefits_plans tables to schema,
// then wire up the Drizzle queries below.

const electionSchema = z.object({
  employeeId: z.string().uuid(),
  planId: z.string().uuid(),
  coverageTier: z.enum(['employee_only', 'employee_spouse', 'employee_children', 'family']),
  effectiveDate: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  await requireServerUser()

  // TODO (Phase 2): Query employee_benefits joined with benefits_plans
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  await requireServerUser()

  const parsed = electionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // TODO (Phase 2): Insert into employee_benefits table
  return NextResponse.json({ message: 'Benefits enrollment queued' }, { status: 202 })
}
