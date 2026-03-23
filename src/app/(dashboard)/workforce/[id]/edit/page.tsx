'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

// TODO: Connected to Supabase via /api/employees

interface Employee {
  [key: string]: string | undefined
  userRole?: string
  position?: string
  department?: string
  email?: string
  phoneNumber?: string
  hireDate?: string
  startDate?: string
  salary?: string
  firstName?: string
}

const EditEmployee = () => {
  const { id } = useParams<{ id: string }>()
  const [employee, setEditEmployee] = useState<Employee>({})
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
          setEditEmployee(data)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connected to Supabase via /api/employees
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    })
    if (res.ok) {
      router.push(`/workforce/${id}`)
    }
  }

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-destructive">{error}</p>

  const fields: { key: string; label: string; disabled?: boolean }[] = [
    { key: 'userRole', label: 'User Role', disabled: true },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'hireDate', label: 'Hire Date' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'salary', label: 'Salary' },
  ]

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <h4 className="text-2xl font-bold">Hi, {employee?.firstName}!</h4>
        <h5 className="text-muted-foreground">Please edit your information:</h5>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <img src="/images/alex.jpg" alt="Profile" width={150} height={150} className="rounded-full" />
        </div>
        <div className="space-y-4">
          {fields.map(({ key, label, disabled }) => (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={key} className="font-medium">{label}:</label>
              <input
                className="border rounded px-3 py-2 w-full disabled:bg-muted"
                type={key.includes('Date') ? 'text' : key === 'email' ? 'email' : 'text'}
                name={key}
                id={key}
                value={employee[key] || ''}
                onChange={handleInputChange}
                disabled={disabled || false}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
            onClick={() => router.push(`/workforce/${id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditEmployee
