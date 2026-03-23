DO $$ BEGIN
 CREATE TYPE "public"."alert_severity" AS ENUM('critical', 'warning', 'info');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."alert_type" AS ENUM('cdl_expiring', 'medical_card_expiring', 'drug_test_due', 'violation_open', 'document_missing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."application_stage" AS ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."beneficiary_type" AS ENUM('primary', 'contingent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cdl_class" AS ENUM('A', 'B', 'C');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."coverage_tier" AS ENUM('employee_only', 'employee_spouse', 'employee_children', 'employee_family');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."document_status" AS ENUM('valid', 'expiring_soon', 'expired', 'pending_review');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."document_type" AS ENUM('w4', 'i9', 'cdl', 'medical_card', 'offer_letter', 'drug_test', 'background_check', 'direct_deposit', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."drug_test_result" AS ENUM('negative', 'positive', 'pending', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."drug_test_type" AS ENUM('pre_employment', 'random', 'post_accident', 'reasonable_suspicion', 'return_to_duty');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive', 'terminated', 'on_leave');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."enrollment_class" AS ENUM('owner', 'manager', 'employee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."family_member_type" AS ENUM('spouse', 'dependent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."health_plan" AS ENUM('none', 'mec', 'standard', 'buy_up');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."incident_severity" AS ENUM('minor', 'moderate', 'major', 'fatality');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."incident_status" AS ENUM('open', 'under_investigation', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."incident_type" AS ENUM('accident', 'near_miss', 'property_damage', 'injury', 'violation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'married_with_dependents', 'single_with_dependents');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'manager', 'driver', 'employee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"source" text,
	"applied_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_id" uuid NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"stage" "application_stage" DEFAULT 'applied' NOT NULL,
	"score" integer,
	"notes" text,
	"reviewed_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"beneficiary_type" "beneficiary_type" NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"relationship" text NOT NULL,
	"date_of_birth" date,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"phone" text,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cdl_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"cdl_class" "cdl_class" NOT NULL,
	"issued_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"endorsements" jsonb DEFAULT '[]'::jsonb,
	"status" "document_status" DEFAULT 'valid' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"dot_number" text,
	"mc_number" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"alert_type" "alert_type" NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"due_date" date NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_at" timestamp,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deductions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"medical_pre_tax" boolean DEFAULT true,
	"medical_amount" numeric(8, 2),
	"dental_pre_tax" boolean DEFAULT true,
	"dental_amount" numeric(8, 2),
	"vision_pre_tax" boolean DEFAULT true,
	"vision_amount" numeric(8, 2),
	"accident_pre_tax" boolean DEFAULT false,
	"accident_amount" numeric(8, 2),
	"cancer_pre_tax" boolean DEFAULT false,
	"cancer_amount" numeric(8, 2),
	"std_pre_tax" boolean DEFAULT false,
	"std_amount" numeric(8, 2),
	"hospital_pre_tax" boolean DEFAULT false,
	"hospital_amount" numeric(8, 2),
	"term_life_pre_tax" boolean DEFAULT false,
	"term_life_amount" numeric(8, 2),
	"whole_life_pre_tax" boolean DEFAULT false,
	"whole_life_amount" numeric(8, 2),
	"other_pre_tax" boolean DEFAULT false,
	"other_amount" numeric(8, 2),
	"other_description" text,
	"employee_signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deductions_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver_risk_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"factors" jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drug_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"test_type" "drug_test_type" NOT NULL,
	"test_date" date NOT NULL,
	"result" "drug_test_result" DEFAULT 'pending' NOT NULL,
	"vendor" text,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"doc_type" "document_type" NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text,
	"expiration_date" date,
	"status" "document_status" DEFAULT 'pending_review' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"location_id" uuid,
	"manager_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"hire_date" date NOT NULL,
	"termination_date" date,
	"cdl_number" text,
	"cdl_state" text,
	"supabase_user_id" text,
	"job_title" text,
	"department" text,
	"date_of_birth" date,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"county" text,
	"marital_status" "marital_status",
	"enrollment_class" "enrollment_class" DEFAULT 'employee',
	"annual_salary" numeric(10, 2),
	"hours_per_week" numeric(4, 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_email_unique" UNIQUE("email"),
	CONSTRAINT "employees_supabase_user_id_unique" UNIQUE("supabase_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"member_type" "family_member_type" NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"gender" text,
	"relationship" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"employer_name" text,
	"employer_address" text,
	"employer_phone" text,
	"is_student" boolean DEFAULT false,
	"is_disabled" boolean DEFAULT false,
	"has_other_medical" boolean DEFAULT false,
	"has_other_dental" boolean DEFAULT false,
	"has_other_vision" boolean DEFAULT false,
	"other_insurance_carrier" text,
	"other_insurance_policy_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_health_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"ims_group_number" text DEFAULT 'SWT0906' NOT NULL,
	"health_plan" "health_plan" DEFAULT 'none' NOT NULL,
	"coverage_tier" "coverage_tier",
	"refusal_reason" text,
	"authorized_person1_name" text,
	"authorized_person1_phone" text,
	"authorized_person2_name" text,
	"authorized_person2_phone" text,
	"authorized_person3_name" text,
	"authorized_person3_phone" text,
	"employee_signed_at" timestamp,
	"effective_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_health_enrollments_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"incident_date" date NOT NULL,
	"incident_type" "incident_type" NOT NULL,
	"severity" "incident_severity" NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"status" "incident_status" DEFAULT 'open' NOT NULL,
	"investigated_by" uuid,
	"reported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location_id" uuid,
	"employment_type" text DEFAULT 'full_time' NOT NULL,
	"description" text NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"posted_date" date,
	"close_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "life_insurance_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"group_plan_number" text DEFAULT '00483632' NOT NULL,
	"enrollment_type" text DEFAULT 'initial' NOT NULL,
	"elects_dental" boolean DEFAULT false,
	"dental_coverage_tier" "coverage_tier",
	"dental_refusal_reason" text,
	"elects_vision" boolean DEFAULT false,
	"vision_coverage_tier" "coverage_tier",
	"vision_refusal_reason" text,
	"elects_basic_life" boolean DEFAULT true,
	"employee_signed_at" timestamp,
	"effective_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "life_insurance_enrollments_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medical_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"exam_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"examiner_name" text,
	"national_registry_num" text,
	"status" "document_status" DEFAULT 'valid' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"unit_number" text NOT NULL,
	"make" text,
	"model" text,
	"year" integer,
	"vin" text,
	"license_plate" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_employees_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cdl_certifications" ADD CONSTRAINT "cdl_certifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compliance_alerts" ADD CONSTRAINT "compliance_alerts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deductions" ADD CONSTRAINT "deductions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "driver_risk_scores" ADD CONSTRAINT "driver_risk_scores_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "drug_tests" ADD CONSTRAINT "drug_tests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "family_members" ADD CONSTRAINT "family_members_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_health_enrollments" ADD CONSTRAINT "group_health_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incidents" ADD CONSTRAINT "incidents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incidents" ADD CONSTRAINT "incidents_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incidents" ADD CONSTRAINT "incidents_investigated_by_employees_id_fk" FOREIGN KEY ("investigated_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "life_insurance_enrollments" ADD CONSTRAINT "life_insurance_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medical_cards" ADD CONSTRAINT "medical_cards_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
