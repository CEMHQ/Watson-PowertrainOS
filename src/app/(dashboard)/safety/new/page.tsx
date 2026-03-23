import { db } from '@/lib/drizzle/db'
import { employees, vehicles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NewIncidentForm } from '@/components/safety/NewIncidentForm'

export default async function NewIncidentPage() {
  const [employeeList, vehicleList] = await Promise.all([
    db
      .select({
        id:        employees.id,
        firstName: employees.firstName,
        lastName:  employees.lastName,
      })
      .from(employees)
      .where(eq(employees.status, 'active'))
      .orderBy(employees.lastName, employees.firstName),

    db
      .select({
        id:         vehicles.id,
        unitNumber: vehicles.unitNumber,
        make:       vehicles.make,
        model:      vehicles.model,
      })
      .from(vehicles)
      .where(eq(vehicles.status, 'active'))
      .orderBy(vehicles.unitNumber),
  ])

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Report Incident</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Document a safety incident, near miss, or violation
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <NewIncidentForm employees={employeeList} vehicles={vehicleList} />
      </div>
    </div>
  )
}
