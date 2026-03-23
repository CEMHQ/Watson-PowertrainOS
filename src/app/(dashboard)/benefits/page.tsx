'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// TODO: Connected to Supabase via /api/employees

interface EmployeeData {
  given_name?: string
  role?: string
  id?: string
}

const GeneralDashboard = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const router = useRouter()

  useEffect(() => {
    // TODO: Connected to Supabase via /api/employees
    const fetchEmployeeData = async () => {
      try {
        const res = await fetch('/api/employees/me')
        if (res.ok) {
          const data = await res.json()
          setEmployeeData(data)
        }
      } catch (error) {
        console.error('Error fetching employee data:', error)
      }
    }

    fetchEmployeeData()
  }, [])

  const handleFleetManagementClick = () => {
    router.push('/dashboard')
  }

  const handleMyProfileClick = () => {
    router.push(`/workforce/${employeeData.id}`)
  }

  const handleBenefitsManagementClick = () => {
    router.push(`/benefits/${employeeData.id}/salary-redirection`)
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {employeeData.given_name || 'User'}!
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {employeeData.role === 'Manager' && (
          <div
            className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleFleetManagementClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFleetManagementClick()}
          >
            <h3 className="text-xl font-semibold mb-2">Fleet Management</h3>
            <p className="text-muted-foreground">Manage fleet operations and vehicle details.</p>
          </div>
        )}

        <div
          className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleMyProfileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleMyProfileClick()}
        >
          <h3 className="text-xl font-semibold mb-2">Profile</h3>
          <p className="text-muted-foreground">View and update your profile.</p>
        </div>

        <div
          className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleBenefitsManagementClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBenefitsManagementClick()}
        >
          <h3 className="text-xl font-semibold mb-2">Benefits Open Enrollment</h3>
          <p className="text-muted-foreground">View and manage your benefits.</p>
        </div>
      </main>
    </div>
  )
}

export default GeneralDashboard
