import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'manager',
  'driver',
  'employee',
])

export const employeeStatusEnum = pgEnum('employee_status', [
  'active',
  'inactive',
  'terminated',
  'on_leave',
])

export const documentTypeEnum = pgEnum('document_type', [
  'w4', 'i9', 'cdl', 'medical_card', 'offer_letter',
  'drug_test', 'background_check', 'direct_deposit', 'other',
])

export const documentStatusEnum = pgEnum('document_status', [
  'valid', 'expiring_soon', 'expired', 'pending_review',
])

export const alertSeverityEnum = pgEnum('alert_severity', [
  'critical', 'warning', 'info',
])

export const alertTypeEnum = pgEnum('alert_type', [
  'cdl_expiring', 'medical_card_expiring', 'drug_test_due',
  'violation_open', 'document_missing',
])

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'minor', 'moderate', 'major', 'fatality',
])

export const incidentTypeEnum = pgEnum('incident_type', [
  'accident', 'near_miss', 'property_damage', 'injury', 'violation',
])

export const incidentStatusEnum = pgEnum('incident_status', [
  'open', 'under_investigation', 'resolved', 'closed',
])

export const applicationStageEnum = pgEnum('application_stage', [
  'applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn',
])

export const cdlClassEnum = pgEnum('cdl_class', ['A', 'B', 'C'])

export const drugTestTypeEnum = pgEnum('drug_test_type', [
  'pre_employment', 'random', 'post_accident',
  'reasonable_suspicion', 'return_to_duty',
])

export const drugTestResultEnum = pgEnum('drug_test_result', [
  'negative', 'positive', 'pending', 'cancelled',
])

// ─── Companies ────────────────────────────────────────────────────────────────

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  dotNumber: text('dot_number'),
  mcNumber: text('mc_number'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Locations ────────────────────────────────────────────────────────────────

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Employees ────────────────────────────────────────────────────────────────

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  managerId: uuid('manager_id'), // self-ref, no FK to avoid circular
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('employee'),
  status: employeeStatusEnum('status').notNull().default('active'),
  hireDate: date('hire_date').notNull(),
  terminationDate: date('termination_date'),
  cdlNumber: text('cdl_number'),
  cdlState: text('cdl_state'),
  supabaseUserId: text('supabase_user_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Documents ────────────────────────────────────────────────────────────────

export const employeeDocuments = pgTable('employee_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  docType: documentTypeEnum('doc_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name'),
  expirationDate: date('expiration_date'),
  status: documentStatusEnum('status').notNull().default('pending_review'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
})

// ─── CDL Certifications ───────────────────────────────────────────────────────

export const cdlCertifications = pgTable('cdl_certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  cdlClass: cdlClassEnum('cdl_class').notNull(),
  issuedDate: date('issued_date').notNull(),
  expirationDate: date('expiration_date').notNull(),
  endorsements: jsonb('endorsements').$type<string[]>().default([]),
  status: documentStatusEnum('status').notNull().default('valid'),
})

// ─── Medical Cards ────────────────────────────────────────────────────────────

export const medicalCards = pgTable('medical_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  examDate: date('exam_date').notNull(),
  expirationDate: date('expiration_date').notNull(),
  examinerName: text('examiner_name'),
  nationalRegistryNum: text('national_registry_num'),
  status: documentStatusEnum('status').notNull().default('valid'),
})

// ─── Drug Tests ───────────────────────────────────────────────────────────────

export const drugTests = pgTable('drug_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  testType: drugTestTypeEnum('test_type').notNull(),
  testDate: date('test_date').notNull(),
  result: drugTestResultEnum('result').notNull().default('pending'),
  vendor: text('vendor'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Compliance Alerts ────────────────────────────────────────────────────────

export const complianceAlerts = pgTable('compliance_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  alertType: alertTypeEnum('alert_type').notNull(),
  severity: alertSeverityEnum('severity').notNull(),
  dueDate: date('due_date').notNull(),
  acknowledged: boolean('acknowledged').default(false).notNull(),
  acknowledgedAt: timestamp('acknowledged_at'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
})

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  unitNumber: text('unit_number').notNull(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  vin: text('vin'),
  licensePlate: text('license_plate'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Incidents ────────────────────────────────────────────────────────────────

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id).notNull(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id),
  incidentDate: date('incident_date').notNull(),
  incidentType: incidentTypeEnum('incident_type').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  status: incidentStatusEnum('status').notNull().default('open'),
  investigatedBy: uuid('investigated_by').references(() => employees.id),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
})

// ─── Driver Risk Scores ───────────────────────────────────────────────────────

export const driverRiskScores = pgTable('driver_risk_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  score: numeric('score', { precision: 5, scale: 2 }).notNull(),
  factors: jsonb('factors').notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
})

// ─── Job Postings ─────────────────────────────────────────────────────────────

export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  employmentType: text('employment_type').notNull().default('full_time'),
  description: text('description').notNull(),
  requirements: jsonb('requirements').$type<string[]>().default([]),
  status: text('status').notNull().default('draft'),
  postedDate: date('posted_date'),
  closeDate: date('close_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Applicants ───────────────────────────────────────────────────────────────

export const applicants = pgTable('applicants', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  source: text('source'),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
})

// ─── Applications ─────────────────────────────────────────────────────────────

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicantId: uuid('applicant_id').references(() => applicants.id).notNull(),
  jobPostingId: uuid('job_posting_id').references(() => jobPostings.id).notNull(),
  stage: applicationStageEnum('stage').notNull().default('applied'),
  score: integer('score'),
  notes: text('notes'),
  reviewedBy: uuid('reviewed_by').references(() => employees.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, { fields: [employees.companyId], references: [companies.id] }),
  location: one(locations, { fields: [employees.locationId], references: [locations.id] }),
  documents: many(employeeDocuments),
  cdlCertifications: many(cdlCertifications),
  medicalCards: many(medicalCards),
  drugTests: many(drugTests),
  complianceAlerts: many(complianceAlerts),
  incidents: many(incidents),
  riskScores: many(driverRiskScores),
}))

export const incidentsRelations = relations(incidents, ({ one }) => ({
  employee: one(employees, { fields: [incidents.employeeId], references: [employees.id] }),
  vehicle: one(vehicles, { fields: [incidents.vehicleId], references: [vehicles.id] }),
}))

export const applicationsRelations = relations(applications, ({ one }) => ({
  applicant: one(applicants, { fields: [applications.applicantId], references: [applicants.id] }),
  jobPosting: one(jobPostings, { fields: [applications.jobPostingId], references: [jobPostings.id] }),
}))
