'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2, Users } from 'lucide-react'
import Link from 'next/link'

type MemberType = 'spouse' | 'dependent'

interface FamilyMember {
  id: string
  memberType: MemberType
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: string | null
  relationship: string | null
  employerName: string | null
  isStudent: boolean | null
  isDisabled: boolean | null
  hasOtherMedical: boolean | null
  hasOtherDental: boolean | null
  hasOtherVision: boolean | null
}

interface Props {
  employeeId: string
  employeeName: string
  maritalStatus: string
  initialMembers: FamilyMember[]
}

const inputClass =
  'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full'

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

const hasSpouse = (ms: string) => ms === 'married' || ms === 'married_with_dependents'
const hasDependents = (ms: string) => ms === 'married_with_dependents' || ms === 'single_with_dependents'

function MemberCard({
  member,
  onDelete,
}: {
  member: FamilyMember
  onDelete: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/benefits/family/${member.id}`, { method: 'DELETE' })
    onDelete(member.id)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {member.memberType}{member.relationship ? ` · ${member.relationship}` : ''}
          {member.dateOfBirth ? ` · DOB ${member.dateOfBirth}` : ''}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

function AddMemberForm({
  employeeId,
  memberType,
  onAdded,
  onCancel,
}: {
  employeeId: string
  memberType: MemberType
  onAdded: (m: FamilyMember) => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      employeeId,
      memberType,
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      dateOfBirth: fd.get('dateOfBirth') || null,
      gender: fd.get('gender') || null,
      relationship: fd.get('relationship') || null,
      employerName: memberType === 'spouse' ? (fd.get('employerName') || null) : null,
      isStudent: memberType === 'dependent' ? fd.get('isStudent') === 'on' : false,
      isDisabled: memberType === 'dependent' ? fd.get('isDisabled') === 'on' : false,
      hasOtherMedical: fd.get('hasOtherMedical') === 'on',
      hasOtherDental: fd.get('hasOtherDental') === 'on',
      hasOtherVision: fd.get('hasOtherVision') === 'on',
      otherInsuranceCarrier: fd.get('otherInsuranceCarrier') || null,
    }

    const res = await fetch('/api/benefits/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to add member')
      setSaving(false)
      return
    }

    const member = await res.json()
    onAdded(member)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground capitalize">Add {memberType}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
          <input name="firstName" required className={inputClass} placeholder="First" />
        </div>
        <div>
          <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
          <input name="lastName" required className={inputClass} placeholder="Last" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input name="dateOfBirth" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select name="gender" className={inputClass}>
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {memberType === 'dependent' && (
        <div>
          <label className={labelClass}>Relationship to Insured</label>
          <select name="relationship" className={inputClass}>
            <option value="">Select…</option>
            <option value="Child">Child</option>
            <option value="Stepchild">Stepchild</option>
            <option value="Foster Child">Foster Child</option>
            <option value="Other Dependent">Other Dependent</option>
          </select>
        </div>
      )}

      {memberType === 'spouse' && (
        <div>
          <label className={labelClass}>Spouse&apos;s Employer</label>
          <input name="employerName" className={inputClass} placeholder="Employer name" />
        </div>
      )}

      {memberType === 'dependent' && (
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" name="isStudent" className="rounded" />
            Full-time student
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" name="isDisabled" className="rounded" />
            Disabled dependent
          </label>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Other Insurance Coverage
        </p>
        <div className="flex flex-wrap gap-4 mb-3">
          {['Medical', 'Dental', 'Vision'].map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" name={`hasOther${t}`} className="rounded" />
              {t}
            </label>
          ))}
        </div>
        <div>
          <label className={labelClass}>Other Insurance Carrier</label>
          <input name="otherInsuranceCarrier" className={inputClass} placeholder="Carrier name" />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : `Add ${memberType}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function FamilyEnrollmentClient({ employeeId, employeeName, maritalStatus, initialMembers }: Props) {
  const router = useRouter()
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers)
  const [adding, setAdding] = useState<MemberType | null>(null)

  const spouse = members.find((m) => m.memberType === 'spouse')
  const dependents = members.filter((m) => m.memberType === 'dependent')

  const handleAdded = (m: FamilyMember) => {
    setMembers((prev) => [...prev, m])
    setAdding(null)
  }

  const handleDeleted = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <Link
          href={`/benefits/${employeeId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Enrollment Hub
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Family Members</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{employeeName}</p>
      </div>

      {/* Spouse */}
      {hasSpouse(maritalStatus) && (
        <section>
          <div className="border-b border-border pb-3 mb-4">
            <h2 className="text-base font-semibold text-foreground">Spouse</h2>
          </div>
          {spouse ? (
            <MemberCard member={spouse} onDelete={handleDeleted} />
          ) : adding === 'spouse' ? (
            <AddMemberForm
              employeeId={employeeId}
              memberType="spouse"
              onAdded={handleAdded}
              onCancel={() => setAdding(null)}
            />
          ) : (
            <button
              onClick={() => setAdding('spouse')}
              className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors w-full"
            >
              <Plus className="h-4 w-4" />
              Add spouse
            </button>
          )}
        </section>
      )}

      {/* Dependents */}
      {hasDependents(maritalStatus) && (
        <section>
          <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Dependents</h2>
            {dependents.length > 0 && adding !== 'dependent' && (
              <button
                onClick={() => setAdding('dependent')}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another
              </button>
            )}
          </div>

          <div className="space-y-3">
            {dependents.map((m) => (
              <MemberCard key={m.id} member={m} onDelete={handleDeleted} />
            ))}
          </div>

          {dependents.length === 0 && adding !== 'dependent' && (
            <button
              onClick={() => setAdding('dependent')}
              className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors w-full"
            >
              <Plus className="h-4 w-4" />
              Add dependent
            </button>
          )}

          {adding === 'dependent' && (
            <div className={dependents.length > 0 ? 'mt-4' : ''}>
              <AddMemberForm
                employeeId={employeeId}
                memberType="dependent"
                onAdded={handleAdded}
                onCancel={() => setAdding(null)}
              />
            </div>
          )}
        </section>
      )}

      {maritalStatus === 'single' && (
        <div className="rounded-lg border border-border bg-muted/30 px-5 py-8 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No family enrollment required</p>
          <p className="text-xs text-muted-foreground mt-1">
            Employee is enrolled as single — no spouse or dependents to add.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(`/benefits/${employeeId}/health`)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Continue to Health Insurance →
        </button>
      </div>
    </div>
  )
}
