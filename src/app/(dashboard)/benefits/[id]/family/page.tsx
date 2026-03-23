import { notFound } from 'next/navigation'
import { db } from '@/lib/drizzle/db'
import { employees, familyMembers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { FamilyEnrollmentClient } from '@/components/benefits/FamilyEnrollmentClient'

export default async function FamilyEnrollmentPage({ params }: { params: { id: string } }) {
  const [employee] = await db
    .select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      maritalStatus: employees.maritalStatus,
    })
    .from(employees)
    .where(eq(employees.id, params.id))

  if (!employee) notFound()

  const members = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.employeeId, params.id))
    .orderBy(familyMembers.memberType, familyMembers.createdAt)

  return (
    <FamilyEnrollmentClient
      employeeId={params.id}
      employeeName={`${employee.firstName} ${employee.lastName}`}
      maritalStatus={employee.maritalStatus ?? 'single'}
      initialMembers={members}
    />
  )
}
