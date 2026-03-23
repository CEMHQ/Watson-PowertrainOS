'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const jobData = [
  {
    id: 1,
    title: 'Diesel Technician',
    city: 'Hobbs',
    state: 'NM',
    type: 'Full-time',
    salary: '90k-130k',
  },
  {
    id: 2,
    title: 'Shop Foreman',
    city: 'Hobbs',
    state: 'NM',
    type: 'Full-time',
    salary: '90k-130k',
  },
  {
    id: 3,
    title: 'Field Mechanic',
    city: 'Midland',
    state: 'TX',
    type: 'Full-time',
    salary: '80k-120k',
  },
  {
    id: 4,
    title: 'Parts Specialist',
    city: 'Odessa',
    state: 'TX',
    type: 'Full-time',
    salary: '60k-90k',
  },
]

export default function CareerConnect() {
  const router = useRouter()

  useEffect(() => {
    if (!sessionStorage.getItem('jobApplicantId')) {
      sessionStorage.setItem('jobApplicantId', '123') // Example ID
    }
  }, [])

  const handleJobDescription = (id: number) => {
    router.push(`/careers/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Career Opportunities</h1>
      <div className="grid grid-cols-1 gap-4">
        {jobData.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border border-border bg-card p-6 flex items-center justify-between"
          >
            <div>
              <h4 className="text-lg font-semibold">{`${job.title} - ${job.city}, ${job.state}`}</h4>
              <p className="text-muted-foreground">{`${job.type} • ${job.salary}`}</p>
            </div>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90 transition-opacity"
              onClick={() => handleJobDescription(job.id)}
            >
              More info
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
