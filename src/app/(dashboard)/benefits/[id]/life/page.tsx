'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

// TODO: Connected to Supabase via /api/benefits

interface Dependent {
  name: string
  dob: string
  relationship: string
}

interface FormData {
  firstName: string
  lastName: string
  ssn: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  maritalStatus: string
  spouseName: string
  spouseDOB: string
  dependents: Dependent[]
}

const GuardianLifeEnrollment = () => {
  const { id } = useParams<{ id: string }>()
  const [currentPage, setCurrentPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    ssn: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    maritalStatus: '',
    spouseName: '',
    spouseDOB: '',
    dependents: [{ name: '', dob: '', relationship: '' }],
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    field?: string
  ) => {
    if (index !== undefined && field) {
      const deps = [...formData.dependents]
      deps[index] = { ...deps[index], [field]: e.target.value }
      setFormData({ ...formData, dependents: deps })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const addDependent = () => {
    if (formData.dependents.length < 4) {
      setFormData({
        ...formData,
        dependents: [...formData.dependents, { name: '', dob: '', relationship: '' }],
      })
    }
  }

  const removeDependent = (index: number) => {
    const updatedDependents = formData.dependents.filter((_, idx) => idx !== index)
    setFormData({ ...formData, dependents: updatedDependents })
  }

  const handleNext = () => setCurrentPage(currentPage + 1)
  const handlePrev = () => setCurrentPage(currentPage - 1)

  const handleReturn = () => {
    router.push('/benefits')
  }

  const handleContinueToAirMed = () => {
    router.push(`/benefits/${id}/airmed`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Connected to Supabase via /api/benefits
      const res = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'guardian_life', employeeId: id }),
      })

      if (res.ok) {
        setShowModal(true)
      } else {
        alert('Submission failed. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      alert('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-center mb-6">
        <Image src="/images/guardian-life.jpg" alt="Guardian Life" width={300} height={100} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPage === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Employee Information</h2>
            {[
              { name: 'firstName', placeholder: 'First Name', type: 'text' },
              { name: 'lastName', placeholder: 'Last Name', type: 'text' },
              { name: 'ssn', placeholder: 'Social Security Number', type: 'text' },
              { name: 'dateOfBirth', placeholder: 'Date of Birth', type: 'date' },
              { name: 'address', placeholder: 'Address', type: 'text' },
              { name: 'city', placeholder: 'City', type: 'text' },
              { name: 'state', placeholder: 'State', type: 'text' },
              { name: 'zip', placeholder: 'Zip', type: 'text' },
              { name: 'phone', placeholder: 'Phone Number', type: 'text' },
              { name: 'email', placeholder: 'Email', type: 'email' },
            ].map(({ name, placeholder, type }) => (
              <input
                key={name}
                className="border rounded px-3 py-2 w-full"
                name={name}
                placeholder={placeholder}
                type={type}
                value={formData[name as keyof FormData] as string}
                onChange={handleChange}
                required
              />
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={handlePrev} className="border rounded px-4 py-2">Previous</button>
              <button type="button" onClick={handleNext} className="bg-primary text-primary-foreground px-4 py-2 rounded">Next</button>
            </div>
          </div>
        )}

        {currentPage === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Family Information</h2>
            <input
              className="border rounded px-3 py-2 w-full"
              name="maritalStatus"
              placeholder="Marital Status"
              value={formData.maritalStatus}
              onChange={handleChange}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full"
              name="spouseName"
              placeholder="Spouse's Name"
              value={formData.spouseName}
              onChange={handleChange}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              type="date"
              name="spouseDOB"
              value={formData.spouseDOB}
              onChange={handleChange}
            />
            <h3 className="font-semibold">Dependents</h3>
            {formData.dependents.map((dep, index) => (
              <div key={index} className="border border-border rounded p-4 space-y-2">
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Dependent Name"
                  value={dep.name}
                  onChange={(e) => handleChange(e, index, 'name')}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="date"
                  placeholder="DOB"
                  value={dep.dob}
                  onChange={(e) => handleChange(e, index, 'dob')}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Relationship"
                  value={dep.relationship}
                  onChange={(e) => handleChange(e, index, 'relationship')}
                />
                <button
                  type="button"
                  className="text-destructive text-sm"
                  onClick={() => removeDependent(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.dependents.length < 4 && (
              <button type="button" className="border rounded px-4 py-2" onClick={addDependent}>
                Add Dependent
              </button>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={handlePrev} className="border rounded px-4 py-2">Previous</button>
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Submit Enrollment</button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6">
        <button
          className="border rounded px-4 py-2 hover:bg-muted transition-colors"
          onClick={handleReturn}
        >
          Return to Dashboard
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full space-y-4">
            <p>Your Guardian Life form was submitted successfully.</p>
            <p>Would you like to continue to AirMedCare Network Enrollment?</p>
            <div className="flex gap-3">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded"
                onClick={handleContinueToAirMed}
              >
                Yes, Continue
              </button>
              <button
                className="border rounded px-4 py-2"
                onClick={() => setShowModal(false)}
              >
                No, Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuardianLifeEnrollment
