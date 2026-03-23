// ─── Auth & Roles ────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'driver' | 'employee'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  locationId?: string
  companyId: string
}

// ─── Employee / Workforce ────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave'
export type PayType = 'hourly' | 'salary' | 'per_mile'

export interface Employee {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  status: EmployeeStatus
  hireDate: string
  terminationDate?: string
  managerId?: string
  locationId?: string
  cdlNumber?: string
  cdlState?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  docType: DocumentType
  fileUrl: string
  expirationDate?: string
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending_review'
  uploadedAt: string
}

export type DocumentType =
  | 'w4'
  | 'i9'
  | 'cdl'
  | 'medical_card'
  | 'offer_letter'
  | 'drug_test'
  | 'background_check'
  | 'direct_deposit'
  | 'other'

// ─── DOT Compliance ──────────────────────────────────────────────────────────

export type ComplianceAlertSeverity = 'critical' | 'warning' | 'info'
export type ComplianceAlertType =
  | 'cdl_expiring'
  | 'medical_card_expiring'
  | 'drug_test_due'
  | 'violation_open'
  | 'document_missing'

export interface ComplianceAlert {
  id: string
  employeeId: string
  employee?: Pick<Employee, 'firstName' | 'lastName'>
  alertType: ComplianceAlertType
  severity: ComplianceAlertSeverity
  dueDate: string
  acknowledged: boolean
  sentAt: string
}

export interface CDLCertification {
  id: string
  employeeId: string
  cdlClass: 'A' | 'B' | 'C'
  issuedDate: string
  expirationDate: string
  endorsements: string[]
  status: 'valid' | 'expiring_soon' | 'expired'
}

export interface DrugTest {
  id: string
  employeeId: string
  testType: 'pre_employment' | 'random' | 'post_accident' | 'reasonable_suspicion' | 'return_to_duty'
  testDate: string
  result: 'negative' | 'positive' | 'pending' | 'cancelled'
  vendor?: string
  reason?: string
}

// ─── Safety & Incidents ──────────────────────────────────────────────────────

export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'fatality'
export type IncidentType = 'accident' | 'near_miss' | 'property_damage' | 'injury' | 'violation'

export interface Incident {
  id: string
  employeeId: string
  vehicleId?: string
  incidentDate: string
  incidentType: IncidentType
  severity: IncidentSeverity
  location: string
  description: string
  status: 'open' | 'under_investigation' | 'resolved' | 'closed'
  investigatedBy?: string
  reportedAt: string
}

export interface DriverRiskScore {
  id: string
  employeeId: string
  score: number // 0-100, lower = higher risk
  factors: RiskFactor[]
  calculatedAt: string
}

export interface RiskFactor {
  category: 'incidents' | 'violations' | 'compliance' | 'performance'
  impact: 'positive' | 'negative'
  weight: number
  description: string
}

// ─── Hiring / ATS ────────────────────────────────────────────────────────────

export type ApplicationStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export interface JobPosting {
  id: string
  companyId: string
  title: string
  department: string
  locationId?: string
  employmentType: 'full_time' | 'part_time' | 'contract'
  description: string
  requirements: string[]
  status: 'draft' | 'published' | 'closed'
  postedDate?: string
  closeDate?: string
}

export interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  source?: string
  appliedAt: string
}

export interface Application {
  id: string
  applicantId: string
  jobPostingId: string
  stage: ApplicationStage
  score?: number
  notes?: string
  reviewedBy?: string
  updatedAt: string
  applicant?: Applicant
  jobPosting?: Pick<JobPosting, 'title' | 'department'>
}

// ─── Shared / UI ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export type SortOrder = 'asc' | 'desc'
