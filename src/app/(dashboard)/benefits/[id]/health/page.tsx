'use client'

import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import Slider from 'react-slick'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

// TODO: Connected to Supabase via /api/benefits

interface Dependent {
  name: string
  ssn: string
  relationship: string
  birthDate: string
  sex: string
}

interface FormData {
  name: string
  birthDate: string
  ssn: string
  insuranceCarrier: string
  policyNumber: string
  phoneNumber: string
  spouseName: string
  spouseEmployer: string
  spouseInsurance: string
  dependents: Dependent[]
  policyholderName: string
  policyholderEmployer: string
  policyholderSSN: string
  policyholderDOB: string
}

const IMSGroupHealthIns = () => {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    ssn: '',
    insuranceCarrier: '',
    policyNumber: '',
    phoneNumber: '',
    spouseName: '',
    spouseEmployer: '',
    spouseInsurance: '',
    dependents: [],
    policyholderName: '',
    policyholderEmployer: '',
    policyholderSSN: '',
    policyholderDOB: '',
  })

  const [files, setFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDependentChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedDependents = [...formData.dependents]
    updatedDependents[index] = { ...updatedDependents[index], [e.target.name]: e.target.value }
    setFormData({ ...formData, dependents: updatedDependents })
  }

  const addDependent = () => {
    setFormData({
      ...formData,
      dependents: [
        ...formData.dependents,
        { name: '', ssn: '', relationship: '', birthDate: '', sex: '' },
      ],
    })
  }

  const removeDependent = (index: number) => {
    const updatedDependents = formData.dependents.filter((_, i) => i !== index)
    setFormData({ ...formData, dependents: updatedDependents })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Connected to Supabase via /api/benefits
      const res = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'ims_group_health', employeeId: id }),
      })

      if (res.ok) {
        setShowModal(true)
      } else {
        alert('Failed to submit the form. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred while submitting the form.')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        // TODO: Upload to Supabase Storage
        console.log('File upload to Supabase Storage - not yet implemented')
      } catch (error) {
        console.error('Error uploading file:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleNextPage = () => {
    if (currentPage < 3) setCurrentPage(currentPage + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleReturnToDashboard = () => {
    router.push('/benefits')
  }

  const handleContinueToGuardianLife = () => {
    router.push(`/benefits/${id}/life`)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-center mb-6">
        <Image src="/images/ins-mgt-serv.jpg" alt="IMS" width={400} height={100} />
      </div>
      <h1 className="text-2xl font-bold mb-6">Group Health Insurance Enrollment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPage === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Page 1: Personal & Spouse Information</h2>
            {[
              { name: 'name', label: 'Name', type: 'text' },
              { name: 'birthDate', label: 'Birth Date', type: 'date' },
              { name: 'ssn', label: 'SSN', type: 'text' },
              { name: 'insuranceCarrier', label: 'Insurance Carrier', type: 'text' },
              { name: 'policyNumber', label: 'Policy Number', type: 'text' },
              { name: 'phoneNumber', label: 'Phone Number', type: 'text' },
              { name: 'spouseName', label: 'Spouse Name', type: 'text' },
              { name: 'spouseEmployer', label: 'Spouse Employer', type: 'text' },
              { name: 'spouseInsurance', label: 'Spouse Insurance Company', type: 'text' },
            ].map(({ name, label, type }) => (
              <label key={name} className="flex flex-col gap-1">
                <span className="font-medium">{label}:</span>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type={type}
                  name={name}
                  value={formData[name as keyof FormData] as string}
                  onChange={handleChange}
                />
              </label>
            ))}
          </div>
        )}

        {currentPage === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Page 2: Dependent Information</h2>
            {formData.dependents.map((dependent, index) => (
              <div key={index} className="border border-border rounded p-4 space-y-2">
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  name="name"
                  placeholder="Dependent Name"
                  value={dependent.name}
                  onChange={(e) => handleDependentChange(e, index)}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  name="ssn"
                  placeholder="Dependent SSN"
                  value={dependent.ssn}
                  onChange={(e) => handleDependentChange(e, index)}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  name="relationship"
                  placeholder="Relationship to Insured"
                  value={dependent.relationship}
                  onChange={(e) => handleDependentChange(e, index)}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="date"
                  name="birthDate"
                  value={dependent.birthDate}
                  onChange={(e) => handleDependentChange(e, index)}
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  name="sex"
                  placeholder="Dependent Sex"
                  value={dependent.sex}
                  onChange={(e) => handleDependentChange(e, index)}
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
            <button
              type="button"
              className="border rounded px-4 py-2"
              onClick={addDependent}
            >
              Add Dependent
            </button>
          </div>
        )}

        {currentPage === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Page 3: Authorization Form</h2>
            {[
              { name: 'policyholderName', label: "Policyholder's Full Name" },
              { name: 'policyholderEmployer', label: "Policyholder's Employer's Name" },
              { name: 'policyholderSSN', label: "Policyholder's SSN" },
            ].map(({ name, label }) => (
              <label key={name} className="flex flex-col gap-1">
                <span className="font-medium">{label}:</span>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type="text"
                  name={name}
                  value={formData[name as keyof FormData] as string}
                  onChange={handleChange}
                />
              </label>
            ))}
            <label className="flex flex-col gap-1">
              <span className="font-medium">Policyholder&apos;s Date of Birth:</span>
              <input
                className="border rounded px-3 py-2 w-full"
                type="date"
                name="policyholderDOB"
                value={formData.policyholderDOB}
                onChange={handleChange}
              />
            </label>
          </div>
        )}

        <div className="flex gap-3">
          {currentPage > 1 && (
            <button type="button" onClick={handlePrevPage} className="border rounded px-4 py-2">Previous</button>
          )}
          {currentPage < 3 && (
            <button type="button" onClick={handleNextPage} className="bg-primary text-primary-foreground px-4 py-2 rounded">Next</button>
          )}
          {currentPage === 3 && (
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Submit Enrollment</button>
          )}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} multiple />
        {uploading && <p>Uploading...</p>}
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
          <Slider {...carouselSettings}>
            {files.map((file, index) => (
              <div key={index}>
                <Document file={file} onLoadSuccess={onLoadSuccess}>
                  {Array.from(new Array(numPages), (el, pageIndex) => (
                    <Page key={pageIndex} pageNumber={pageIndex + 1} />
                  ))}
                </Document>
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className="mt-6">
        <button
          className="border rounded px-4 py-2 hover:bg-muted transition-colors"
          onClick={handleReturnToDashboard}
        >
          Return to Dashboard
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full space-y-4">
            <p>Your IMS Group Health Insurance form was submitted successfully.</p>
            <p>Would you like to continue to Guardian Life Insurance Enrollment?</p>
            <div className="flex gap-3">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded"
                onClick={handleContinueToGuardianLife}
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

export default IMSGroupHealthIns
