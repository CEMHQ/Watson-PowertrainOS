import { cn } from '@/lib/utils'

type Status = 'active' | 'inactive' | 'terminated' | 'on_leave'

const statusConfig: Record<Status, { label: string; className: string }> = {
  active:     { label: 'Active',     className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900' },
  inactive:   { label: 'Inactive',   className: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800' },
  terminated: { label: 'Terminated', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900' },
  on_leave:   { label: 'On leave',   className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900' },
}

export function EmployeeStatusBadge({ status }: { status: Status | string }) {
  const config = statusConfig[status as Status] ?? { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}
