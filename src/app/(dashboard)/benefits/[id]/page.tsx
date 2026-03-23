import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/drizzle/db'
import {
  employees, familyMembers, groupHealthEnrollments,
  lifeInsuranceEnrollments, beneficiaries, deductions,
} from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import {
  Users, Heart, Shield, DollarSign, CheckCircle2,
  ArrowLeft, ChevronRight, AlertCircle,
} from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  none: 'No Medical', mec: 'MEC Plan',
  standard: 'Standard Plan', buy_up: 'Buy Up Plan',
}

const TIER_LABELS: Record<string, string> = {
  employee_only: 'Employee Only', employee_spouse: 'Employee + Spouse',
  employee_children: 'Employee + Children', employee_family: 'Employee + Family',
}

export default async function BenefitsHubPage({ params }: { params: { id: string } }) {
  const [employee] = await db
    .select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      maritalStatus: employees.maritalStatus,
      enrollmentClass: employees.enrollmentClass,
    })
    .from(employees)
    .where(eq(employees.id, params.id))

  if (!employee) notFound()

  const [
    familyCount,
    healthEnrollment,
    lifeEnrollment,
    beneficiaryRows,
    deductionRecord,
  ] = await Promise.all([
    db.select({ n: count() }).from(familyMembers).where(eq(familyMembers.employeeId, params.id)),
    db.select().from(groupHealthEnrollments).where(eq(groupHealthEnrollments.employeeId, params.id)),
    db.select().from(lifeInsuranceEnrollments).where(eq(lifeInsuranceEnrollments.employeeId, params.id)),
    db.select({ n: count() }).from(beneficiaries).where(eq(beneficiaries.employeeId, params.id)),
    db.select().from(deductions).where(eq(deductions.employeeId, params.id)),
  ])

  const ms = employee.maritalStatus
  const needsFamily = ms === 'married' || ms === 'married_with_dependents' || ms === 'single_with_dependents'
  const hasFamily = (familyCount[0]?.n ?? 0) > 0
  const hasHealth = healthEnrollment.length > 0
  const hasLife = lifeEnrollment.length > 0
  const hasBeneficiaries = (beneficiaryRows[0]?.n ?? 0) > 0
  const hasDeductions = deductionRecord.length > 0

  const steps = [
    ...(needsFamily ? [{
      label: 'Family Members',
      desc: hasFamily
        ? `${familyCount[0]?.n ?? 0} member${(familyCount[0]?.n ?? 0) !== 1 ? 's' : ''} enrolled`
        : 'Add spouse and/or dependents',
      done: hasFamily,
      href: `/benefits/${params.id}/family`,
      Icon: Users,
    }] : []),
    {
      label: 'Group Health Insurance',
      desc: hasHealth
        ? `${PLAN_LABELS[healthEnrollment[0]?.healthPlan ?? 'none']}${healthEnrollment[0]?.coverageTier ? ` · ${TIER_LABELS[healthEnrollment[0].coverageTier]}` : ''}`
        : 'IMS Managed Care — Group SWT0906',
      done: hasHealth,
      href: `/benefits/${params.id}/health`,
      Icon: Heart,
    },
    {
      label: 'Life Insurance',
      desc: hasLife
        ? `Guardian Group Plan 00483632 · ${lifeEnrollment[0]?.enrollmentType ?? 'initial'}`
        : 'Guardian dental, vision & life AD&D',
      done: hasLife,
      href: `/benefits/${params.id}/life`,
      Icon: Shield,
    },
    {
      label: 'Beneficiary Designations',
      desc: hasBeneficiaries
        ? `${beneficiaryRows[0]?.n ?? 0} beneficiar${(beneficiaryRows[0]?.n ?? 0) !== 1 ? 'ies' : 'y'} designated`
        : 'Primary and contingent beneficiaries',
      done: hasBeneficiaries,
      href: `/benefits/${params.id}/beneficiaries`,
      Icon: Users,
    },
    {
      label: 'Salary Redirection',
      desc: hasDeductions
        ? 'Pre-tax and post-tax deductions recorded'
        : 'Authorize payroll deductions — Watson Truck & Supply',
      done: hasDeductions,
      href: `/benefits/${params.id}/salary-redirection`,
      Icon: DollarSign,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone = completedCount === steps.length

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/workforce/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Benefits Enrollment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {employee.firstName} {employee.lastName}
          {employee.enrollmentClass && (
            <span className="ml-2 capitalize text-xs bg-muted px-1.5 py-0.5 rounded">
              {employee.enrollmentClass}
            </span>
          )}
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Enrollment Progress</p>
          <p className="text-sm text-muted-foreground">{completedCount} of {steps.length} complete</p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${steps.length > 0 ? (completedCount / steps.length) * 100 : 0}%` }}
          />
        </div>
        {allDone && (
          <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5 mt-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All enrollment steps complete
          </p>
        )}
      </div>

      {/* Marital status notice */}
      {!employee.maritalStatus && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-900 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Marital status not set</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Update the employee profile to unlock the full enrollment wizard.
            </p>
          </div>
        </div>
      )}

      {/* Enrollment steps */}
      <div className="rounded-lg border border-border overflow-hidden">
        {steps.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className={cn(
              'flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40',
              i < steps.length - 1 && 'border-b border-border'
            )}
          >
            <div className={cn(
              'rounded-xl p-2.5 flex-shrink-0',
              step.done ? 'bg-green-50 dark:bg-green-950' : 'bg-muted'
            )}>
              <step.Icon className={cn(
                'h-4 w-4',
                step.done ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.desc}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pending</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
