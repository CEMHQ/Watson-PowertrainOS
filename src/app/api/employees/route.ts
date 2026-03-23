import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/db'
import { employees } from '@/db/schema'
import { eq, and, ilike, desc } from 'drizzle-orm'
import { requireServerUser } from '@/lib/supabase/server'
import { z } from 'zod'

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'driver', 'employee']),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locationId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  cdlNumber: z.string().optional(),
  cdlState: z.string().length(2).optional(),
})

// GET /api/employees
export async function GET(request: NextRequest) {
  try {
    await requireServerUser()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '25')
    const offset = (page - 1) * pageSize

    // Build where conditions
    const conditions = []
    if (status) conditions.push(eq(employees.status, status as any))
    if (role) conditions.push(eq(employees.role, role as any))
    if (search) {
      conditions.push(ilike(employees.firstName, `%${search}%`))
    }

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(employees)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(employees.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: employees.id })
        .from(employees)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ])

    return NextResponse.json({
      data,
      count: countResult.length,
      page,
      pageSize,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/employees
export async function POST(request: NextRequest) {
  try {
    await requireServerUser()

    const body = await request.json()
    const parsed = createEmployeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // TODO: get companyId from user session/claims
    const companyId = body.companyId

    const [employee] = await db
      .insert(employees)
      .values({
        ...parsed.data,
        companyId,
      })
      .returning()

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
