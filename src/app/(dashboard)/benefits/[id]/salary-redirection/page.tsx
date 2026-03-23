'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

// TODO: Connected to Supabase via /api/benefits

interface FormData {
  lastName: string
  firstName: string
  middleInitial: string
  address: string
  cityStateZip: string
  ssn: string
  hireDate: string
  effectiveDate: string
  medicalPreTax: string
  medicalPreTaxAmount: string
  medicalPostTax: string
  medicalPostTaxAmount: string
  understand1: string
  understand2: string
  understand3: string
  understand4: string
  waiver: string
  employeeSignature: string
  signatureDate: string
}

const SalaryRedirectionAgreement = () => {
  const [formData, setFormData] = useState<FormData>({
    lastName: '',
    firstName: '',
    middleInitial: '',
    address: '',
    cityStateZip: '',
    ssn: '',
    hireDate: '',
    effectiveDate: '',
    medicalPreTax: '',
    medicalPreTaxAmount: '',
    medicalPostTax: '',
    medicalPostTaxAmount: '',
    understand1: '',
    understand2: '',
    understand3: '',
    understand4: '',
    waiver: '',
    employeeSignature: '',
    signatureDate: '',
  })

  const [currentSection, setCurrentSection] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNextSection = () => {
    if (currentSection < 3) setCurrentSection(currentSection + 1)
  }

  const handlePrevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1)
  }

  const handleReturnToDashboard = () => {
    router.push('/benefits')
  }

  const handleContinueToHealth = () => {
    router.push(`/benefits/${id}/health`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // TODO: Connected to Supabase via /api/benefits
      const res = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'salary_redirection', employeeId: id }),
      })

      if (res.ok) {
        setShowModal(true)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      alert('Error submitting the form.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      {currentSection === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Salary Redirection Agreement - Section 1</h2>
          <p className="text-sm text-muted-foreground">
            EMPLOYER: Watson Truck & Supply, Inc. CAFETERIA PLAN YEAR: 1/1/2019 thru 12/31/2019
          </p>

          {[
            { name: 'lastName', label: 'Name (Last)', type: 'text' },
            { name: 'firstName', label: 'Name (First)', type: 'text' },
            { name: 'middleInitial', label: 'Middle Initial', type: 'text' },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'cityStateZip', label: 'City/State/Zip', type: 'text' },
            { name: 'ssn', label: 'Social Security Number', type: 'text' },
            { name: 'hireDate', label: 'Hire Date', type: 'date' },
            { name: 'effectiveDate', label: 'Effective Date', type: 'date' },
          ].map(({ name, label, type }) => (
            <label key={name} className="flex flex-col gap-1">
              <span className="font-medium">{label}:</span>
              <input
                className="border rounded px-3 py-2 w-full"
                type={type}
                name={name}
                value={formData[name as keyof FormData]}
                onChange={handleChange}
              />
            </label>
          ))}

          <p className="text-sm text-muted-foreground">
            On a separate benefit enrollment form(s), I have enrolled for certain insurance coverage(s) and understand
            that my insurance premiums election amount will be deducted from my paycheck by my employer...
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNextSection}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Next Section
            </button>
          </div>
        </div>
      )}

      {currentSection === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Salary Redirection Agreement - Section 2</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Coverage</th>
                  <th className="border border-border p-2 text-left">Provider</th>
                  <th className="border border-border p-2 text-left">EE Election Pre-tax</th>
                  <th className="border border-border p-2 text-left">Premium Pre-Tax</th>
                  <th className="border border-border p-2 text-left">EE Election Post-tax</th>
                  <th className="border border-border p-2 text-left">Premium Post-Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">Medical</td>
                  <td className="border border-border p-2">Insurance Management Services</td>
                  <td className="border border-border p-2">
                    <input
                      className="border rounded px-2 py-1 w-24"
                      type="number"
                      name="medicalPreTax"
                      value={formData.medicalPreTax}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <input
                      className="border rounded px-2 py-1 w-24"
                      type="number"
                      name="medicalPreTaxAmount"
                      value={formData.medicalPreTaxAmount}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <input
                      className="border rounded px-2 py-1 w-24"
                      type="number"
                      name="medicalPostTax"
                      value={formData.medicalPostTax}
                      onChange={handleChange}
                    />
                  </td>
                  <td className="border border-border p-2">
                    <input
                      className="border rounded px-2 py-1 w-24"
                      type="number"
                      name="medicalPostTaxAmount"
                      value={formData.medicalPostTaxAmount}
                      onChange={handleChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>Total Pre-Tax: </strong>
            <strong>Total Post-Tax: </strong>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handlePrevSection} className="border rounded px-4 py-2">Previous</button>
            <button type="button" onClick={handleNextSection} className="bg-primary text-primary-foreground px-4 py-2 rounded">Next</button>
          </div>
        </div>
      )}

      {currentSection === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">Salary Redirection Agreement - Section 3</h2>
          <p>I understand and agree to the following:</p>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                type="text"
                name={`understand${i}`}
                value={formData[`understand${i}` as keyof FormData]}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-16 flex-shrink-0"
                maxLength={2}
                placeholder="Init"
              />
              <label className="text-sm">
                {i === 1 && 'On or after the first day of the plan year, I cannot change or revoke this Salary Redirection Agreement...'}
                {i === 2 && 'Execution of this Salary Redirection Agreement does not begin coverage under the component benefit plans...'}
                {i === 3 && 'I hereby specifically authorize those parties to use my personal information...'}
                {i === 4 && 'Paying for coverage on a pre-tax basis may cause insurance claim payments to be subject to federal and state taxes...'}
              </label>
            </div>
          ))}

          <div className="flex gap-3 items-start">
            <input
              type="text"
              name="waiver"
              value={formData.waiver}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-16 flex-shrink-0"
              maxLength={2}
              placeholder="Init"
            />
            <label className="text-sm">
              I certify that the features and benefits under the Benefits Plan have been explained to me...
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Employee Signature:</label>
            <input
              className="border rounded px-3 py-2 w-full"
              name="employeeSignature"
              value={formData.employeeSignature}
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
              value={formData.signatureDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handlePrevSection} className="border rounded px-4 py-2">Previous</button>
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Submit</button>
          </div>
        </form>
      )}

      <div className="flex gap-3">
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
            <p>Your form has been successfully submitted!</p>
            <p>Would you like to continue to Group Health Insurance Enrollment?</p>
            <div className="flex gap-3">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded"
                onClick={handleContinueToHealth}
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

export default SalaryRedirectionAgreement
