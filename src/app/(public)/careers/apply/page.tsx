'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// TODO: Connected to Supabase via /api/hiring

interface FormData {
  position: string
  startDate: string
  signature: string
  signatureDate: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phoneNumber: string
  email: string
}

export default function CreateApplication() {
  const router = useRouter()

  const [jobDescriptionId, setJobDescriptionId] = useState<string | null>(null)
  const [jobApplicantId, setJobApplicantId] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    position: '',
    startDate: '',
    signature: '',
    signatureDate: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
  })

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    setJobApplicantId(query.get('jobApplicantId'))
    setJobDescriptionId(query.get('jobDescriptionId'))
  }, [])

  useEffect(() => {
    if (!jobDescriptionId) return

    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/hiring?id=${jobDescriptionId}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setFormData((prev) => ({
          ...prev,
          position: data.position || '',
        }))
      } catch (error) {
        console.error('Error fetching job details:', error)
      }
    }

    fetchJobDetails()
  }, [jobDescriptionId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.signature || !formData.signatureDate) {
      alert('Please complete the signature and date fields.')
      return
    }

    const data = {
      ...formData,
      jobApplicantId,
      jobDescriptionId,
    }

    try {
      // TODO: Connected to Supabase via /api/hiring
      const res = await fetch('/api/hiring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/careers/apply/success')
      } else {
        alert('There was an error submitting your application. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('There was an error submitting your application. Please try again.')
    }
  }

  if (!jobApplicantId || !jobDescriptionId) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Create Application</h2>
      <p className="text-sm font-bold text-center mb-6">
        WE ARE AN EQUAL EMPLOYMENT OPPORTUNITY EMPLOYER AND DO NOT DISCRIMINATE ON THE BASIS OF RACE,
        COLOR, RELIGION, SEX, NATIONAL ORIGIN, AGE, DISABILITY, OR ANY OTHER PROTECTED CLASS.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="border border-border rounded p-4 space-y-4">
          <legend className="font-semibold px-2">Applicant&apos;s Information</legend>

          <div className="flex flex-col gap-1">
            <label htmlFor="position" className="font-medium">Position:</label>
            <input
              className="border rounded px-3 py-2 w-full bg-muted"
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Position Applying for"
              disabled
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="startDate" className="font-medium">Start Date:</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="signature" className="font-medium">Applicant&apos;s Signature:</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Signature"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="signatureDate" className="font-medium">Date:</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="date"
              name="signatureDate"
              value={formData.signatureDate}
              onChange={handleChange}
              required
            />
          </div>

          <h3 className="text-lg font-semibold">Applicant&apos;s Personal Information</h3>

          {[
            { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'First Name' },
            { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Last Name' },
            { name: 'address', label: 'Address', type: 'text', placeholder: 'Street Address' },
            { name: 'city', label: 'City', type: 'text', placeholder: 'City' },
            { name: 'state', label: 'State', type: 'text', placeholder: 'State' },
            { name: 'zipCode', label: 'Zip Code', type: 'text', placeholder: 'Zip Code' },
            { name: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: 'Phone Number' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'Email' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="font-medium">{label}:</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type={type}
                name={name}
                value={formData[name as keyof FormData] as string}
                onChange={handleChange}
                placeholder={placeholder}
                required
              />
            </div>
          ))}
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
