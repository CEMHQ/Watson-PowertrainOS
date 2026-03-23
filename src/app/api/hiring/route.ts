import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit } from '@/lib/redis/ratelimit'
import { db } from '@/lib/drizzle/db'
import { applicants, applications, jobPostings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const applicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  position: z.string().optional(),
  jobPostingId: z.string().uuid(),
  coverLetter: z.string().optional(),
  experience: z.array(z.string()).optional(),
  certifications: z.string().optional(),
  hasDriversLicense: z.boolean().optional(),
  driversLicenseState: z.string().optional(),
  driversLicenseNumber: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  // Public endpoint — returns active job postings only
  const postings = await db
    .select({
      id: jobPostings.id,
      title: jobPostings.title,
      department: jobPostings.department,
      locationId: jobPostings.locationId,
      employmentType: jobPostings.employmentType,
      description: jobPostings.description,
      postedAt: jobPostings.createdAt,
    })
    .from(jobPostings)
    .where(eq(jobPostings.status, 'open'))

  return NextResponse.json(postings)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await apiRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  // Public endpoint — no auth required to submit an application
  const parsed = applicationSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { firstName, lastName, email, phone, jobPostingId } = parsed.data

  // Upsert applicant by email (idempotent)
  const [applicant] = await db
    .insert(applicants)
    .values({
      firstName,
      lastName,
      email,
      phone: phone ?? undefined,
      source: 'career_hub',
    })
    .onConflictDoUpdate({
      target: applicants.email,
      set: { firstName, lastName, phone: phone ?? undefined },
    })
    .returning()

  // Create application record
  const [application] = await db
    .insert(applications)
    .values({
      applicantId: applicant.id,
      jobPostingId,
      stage: 'applied',
      notes: parsed.data.coverLetter ?? undefined,
    })
    .returning()

  return NextResponse.json(
    { message: 'Application submitted successfully', applicationId: application.id },
    { status: 201 }
  )
}
