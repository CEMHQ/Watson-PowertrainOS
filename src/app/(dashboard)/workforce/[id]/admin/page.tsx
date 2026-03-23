'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Employee {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: string
  status?: string
  department?: string
  hireDate?: string
  [key: string]: unknown
}

export default function AdminEmployeeProfile() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) {
        setError('No employee ID found in the route.')
        setLoading(false)
        return
      }

      try {
        // TODO: Connected to Supabase via /api/employees
        const res = await fetch(`/api/employees/${id}`)
        if (!res.ok) {
          setError('Employee not found.')
          setLoading(false)
          return
        }
        const data: Employee = await res.json()
        setEmployee(data)
      } catch {
        setError('Failed to load employee profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading employee profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {employee?.firstName} {employee?.lastName}
          </h1>
          <p className="text-muted-foreground">{employee?.role} — {employee?.department}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/workforce/${id}/edit`)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Contact Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{employee?.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-foreground">{employee?.phone ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Employment Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground capitalize">{employee?.status ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hire Date</span>
              <span className="text-foreground">{employee?.hireDate ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
