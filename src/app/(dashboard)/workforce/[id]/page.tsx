'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

// TODO: Connected to Supabase via /api/employees

interface Employee {
  firstName?: string
  userRole?: string
  position?: string
  department?: string
  email?: string
  phoneNumber?: string
  hireDate?: string
  startDate?: string
  salary?: string
}

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) {
        setError('No ID found in the route.')
        setLoading(false)
        return
      }

      try {
        // TODO: Connected to Supabase via /api/employees
        const res = await fetch(`/api/employees/${id}`)
        if (res.ok) {
          const data = await res.json()
          setEmployee(data)
        } else {
          setError('Employee not found.')
        }
      } catch (err) {
        console.error('Error fetching employee data:', err)
        setError('Failed to fetch employee data.')
      }
      setLoading(false)
    }

    fetchEmployeeData()
  }, [id])

  if (loading) return <p className="p-8">Loading employee profile...</p>
  if (error) return <p className="p-8 text-destructive">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <h4 className="text-2xl font-bold">Hi, {employee?.firstName}!</h4>
        <h5 className="text-muted-foreground">Please review information:</h5>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex-shrink-0">
          <Image src="/images/alex.jpg" alt="Profile Picture" width={150} height={150} className="rounded-full" />
        </div>
        <div className="space-y-2">
          <p><strong>User Role:</strong> {employee?.userRole}</p>
          <p><strong>Position:</strong> {employee?.position}</p>
          <p><strong>Department:</strong> {employee?.department}</p>
          <p><strong>Email:</strong> {employee?.email}</p>
          <p><strong>Phone:</strong> {employee?.phoneNumber}</p>
          <p><strong>Hire Date:</strong> {employee?.hireDate}</p>
          <p><strong>Start Date:</strong> {employee?.startDate}</p>
          <p><strong>Salary:</strong> {employee?.salary}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          onClick={() => router.push(`/workforce/${id}/edit`)}
        >
          Edit Profile
        </button>
        <button
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          onClick={() => router.push('/benefits')}
        >
          Dashboard
        </button>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          onClick={() => router.push(`/benefits/${id}`)}
        >
          My Benefits
        </button>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          onClick={() => router.push(`/benefits/${id}/salary-redirection`)}
        >
          Open Enrollment
        </button>
      </div>
    </div>
  )
}

export default EmployeeProfile
