'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

// TODO: Connected to Supabase via /api/benefits

interface AdditionalMember {
  firstName: string
  lastName: string
  dateOfBirth: string
}

interface FormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  mailingAddress: string
  city: string
  state: string
  zip: string
  physicalAddress: string
  physicalCity: string
  physicalState: string
  physicalZip: string
  homePhone: string
  cellPhone: string
  county: string
  email: string
  additionalMembers: AdditionalMember[]
  membershipOption: string
  employeeSignature?: string
  signatureDate?: string
}

const AirMedCareEnrollment = () => {
  const { id } = useParams<{ id: string }>()
  const [currentPage, setCurrentPage] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mailingAddress: '',
    city: '',
    state: '',
    zip: '',
    physicalAddress: '',
    physicalCity: '',
    physicalState: '',
    physicalZip: '',
    homePhone: '',
    cellPhone: '',
    county: '',
    email: '',
    additionalMembers: [{ firstName: '', lastName: '', dateOfBirth: '' }],
    membershipOption: '1-Year Membership',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
    field?: string
  ) => {
    if (index !== undefined && field) {
      const members = [...formData.additionalMembers]
      members[index] = { ...members[index], [field]: e.target.value }
      setFormData({ ...formData, additionalMembers: members })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const addMember = () => {
    if (formData.additionalMembers.length < 5) {
      setFormData({
        ...formData,
        additionalMembers: [...formData.additionalMembers, { firstName: '', lastName: '', dateOfBirth: '' }],
      })
    }
  }

  const removeMember = (index: number) => {
    const updatedMembers = formData.additionalMembers.filter((_, idx) => idx !== index)
    setFormData({ ...formData, additionalMembers: updatedMembers })
  }

  const handleNext = () => setCurrentPage(currentPage + 1)
  const handlePrev = () => setCurrentPage(currentPage - 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connected to Supabase via /api/benefits
    console.log('Submitted Data:', formData)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-center mb-6">
        <Image src="/images/air-med-care.png" alt="Air Med Care" width={400} height={100} />
      </div>

      {currentPage === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Membership Terms and Conditions</h2>
          <div className="border border-border rounded p-4 h-40 overflow-y-auto">
            <p>Please read the terms carefully...</p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
            />
            I agree to the terms and conditions
          </label>
          <button
            disabled={!agreeTerms}
            onClick={handleNext}
            className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPage === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Member Contact Information</h2>
            {[
              { name: 'firstName', placeholder: 'First Name', type: 'text' },
              { name: 'lastName', placeholder: 'Last Name', type: 'text' },
              { name: 'dateOfBirth', placeholder: 'Date of Birth', type: 'date' },
              { name: 'mailingAddress', placeholder: 'Mailing Address', type: 'text' },
              { name: 'city', placeholder: 'City', type: 'text' },
              { name: 'state', placeholder: 'State', type: 'text' },
              { name: 'zip', placeholder: 'Zip', type: 'text' },
              { name: 'homePhone', placeholder: 'Home Phone', type: 'text' },
              { name: 'cellPhone', placeholder: 'Cell Phone', type: 'text' },
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
                required={['firstName', 'lastName', 'dateOfBirth', 'mailingAddress', 'city', 'state', 'zip', 'email'].includes(name)}
              />
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={handlePrev} className="border rounded px-4 py-2">Previous</button>
              <button type="button" onClick={handleNext} className="bg-primary text-primary-foreground px-4 py-2 rounded">Next</button>
            </div>
          </div>
        )}

        {currentPage === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Additional Members in Household</h2>
            {formData.additionalMembers.map((member, index) => (
              <div key={index} className="border border-border rounded p-4 space-y-2">
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="First Name"
                  value={member.firstName}
                  onChange={(e) => handleChange(e, index, 'firstName')}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Last Name"
                  value={member.lastName}
                  onChange={(e) => handleChange(e, index, 'lastName')}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="date"
                  value={member.dateOfBirth}
                  onChange={(e) => handleChange(e, index, 'dateOfBirth')}
                />
                <button
                  type="button"
                  className="border rounded px-3 py-1 text-sm"
                  onClick={() => removeMember(index)}
                >
                  Remove Member
                </button>
              </div>
            ))}
            {formData.additionalMembers.length < 5 && (
              <button type="button" className="border rounded px-4 py-2" onClick={addMember}>
                Add Another Member
              </button>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={handlePrev} className="border rounded px-4 py-2">Previous</button>
              <button type="button" onClick={handleNext} className="bg-primary text-primary-foreground px-4 py-2 rounded">Next</button>
            </div>
          </div>
        )}

        {currentPage === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Membership Option</h2>
            <select
              className="border rounded px-3 py-2 w-full"
              name="membershipOption"
              value={formData.membershipOption}
              onChange={handleChange}
            >
              <option>1-Year Membership - $55</option>
            </select>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Employee Signature:</label>
              <input
                className="border rounded px-3 py-2 w-full"
                name="employeeSignature"
                value={formData.employeeSignature || ''}
                onChange={handleChange}
                placeholder="Employee Signature"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Date:</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="date"
                name="signatureDate"
                value={formData.signatureDate || ''}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handlePrev} className="border rounded px-4 py-2">Previous</button>
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Submit Application</button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default AirMedCareEnrollment
