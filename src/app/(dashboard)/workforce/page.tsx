import { db } from '@/lib/drizzle/db'
import { employees } from '@/db/schema'
import { desc, eq, ilike, and } from 'drizzle-orm'
import { Search, Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import { EmployeeStatusBadge } from '@/components/workforce/EmployeeStatusBadge'

interface WorkforcePageProps {
  searchParams: { search?: string; status?: string; role?: string }
}

async function getEmployees(filters: WorkforcePageProps['searchParams']) {
  const conditions = []
  if (filters.status) conditions.push(eq(employees.status, filters.status as any))
  if (filters.role) conditions.push(eq(employees.role, filters.role as any))

  return db
    .select()
    .from(employees)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(employees.createdAt))
    .limit(50)
}

export default async function WorkforcePage({ searchParams }: WorkforcePageProps) {
  const data = await getEmployees(searchParams)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Workforce</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data.length} employees</p>
        </div>
        <Link
          href="/workforce/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add employee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search by name or email..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </form>
        <select
          name="status"
          defaultValue={searchParams.status}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
          <option value="on_leave">On leave</option>
        </select>
        <select
          name="role"
          defaultValue={searchParams.role}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All roles</option>
          <option value="driver">Driver</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Hire date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">CDL</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No employees found. Add your first employee to get started.
                </td>
              </tr>
            ) : (
              data.map(emp => (
                <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-foreground">{emp.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <EmployeeStatusBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {emp.hireDate}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {emp.cdlNumber ? (
                      <span className="font-mono text-xs">{emp.cdlNumber} ({emp.cdlState})</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/workforce/${emp.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
