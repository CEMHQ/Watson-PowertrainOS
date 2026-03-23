# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Watson PowertrainOS is a fleet workforce and compliance operating system for **Watson Truck & Supply, Inc.**, **Watson Hopper Inc.**, and **Unit Shop, LLC** — all operating from 1501 N Grimes St, Hobbs, NM 88240. It manages the full employee lifecycle — hiring, onboarding, DOT compliance tracking, safety incident management, benefits enrollment, and workforce analytics.

**Business model**: Internal platform for all three Watson entities. Manages drivers, mechanics, office staff, and field employees across multiple New Mexico locations. Core differentiator is the DOT Compliance Engine — automated CDL expiration tracking, medical card monitoring, drug test scheduling, and audit-readiness tooling.

**Current status**: Phase 1 complete (schema, auth, workforce hub, DOT compliance dashboard, safety & incident tracking). Phase 2 in progress (benefits enrollment wizard, hiring ATS, digital employment application).

**Workspace layout**: The root IS the project. `src/` contains all application code. `functions/` contains Firebase Cloud Functions for secure API key retrieval. `_archive/` holds the old `client/` and `powertrainos/` subdirectories for reference — do not develop there.

```
src/app/
  (public)/     ← No auth: /, /about, /contact, /team, /careers, /careers/apply
  (dashboard)/  ← Requires Supabase auth: /dashboard, /workforce, /compliance, /benefits, /safety, /hiring, /ai
  auth/         ← /auth/login (Supabase email/password)
  api/          ← All API routes
```

Before implementing any feature, read the relevant doc in `docs/`:

| Topic | Doc |
|---|---|
| Database schema (canonical) | `docs/01_Database_Schema.md` |
| Architecture & tech stack | `docs/02_System_Architecture.md` |
| Module roadmap & phasing | `docs/03_Module_Roadmap.md` |
| Developer guide | `docs/04_Developer_Guide.md` |
| DOT compliance rules | `docs/05_DOT_Compliance_Rules.md` |
| Benefits & enrollment data | `docs/06_Benefits_Reference.md` |
| Role & permission model | `docs/07_Role_Permissions.md` |
| Onboarding workflows | `docs/08_Onboarding_Workflows.md` |
| Hiring & ATS flows | `docs/09_Hiring_ATS_Flows.md` |
| Safety & incident model | `docs/10_Safety_Incident_Model.md` |
| AI assistant spec | `docs/11_AI_Assistant_Spec.md` |
| n8n automation workflows | `docs/12_Automation_Workflows.md` |
| Data security & audit | `docs/13_Data_Security_Audit.md` |

UI rules are in `CLAUDE_UI.md`.

---

## Design System

### Brand Colors
These hex values are consistent across all Watson projects (WatsonDB C#, WatsonFleetFusion Node.js, and now PowertrainOS). Always use the Tailwind tokens — do not hardcode hex values.

| Token | Tailwind class | Hex | Use |
|---|---|---|---|
| Primary brand blue | `bg-watson-blue` / `text-watson-blue` | `#2e4593` | Buttons, headers, nav, links |
| Dark navy | `bg-watson-dark` / `sidebar` | `#1f3471` | Sidebar background, gradient start |
| Light blue | `bg-watson-light` | `#3b82f6` | Gradient end, hover states |
| Card hover | `bg-watson-hover` / `bg-accent` | `#e0ebff` | Card hover background |
| Page background | `bg-watson-bg` | `#f4f4f4` | Public page backgrounds |

**Gradient** (hero sections, login header, career hub): `className="watson-gradient"`
CSS: `linear-gradient(to right, #1f3471, #3b82f6)`

**Card pattern** (use on all card components): `className="watson-card"`
CSS: white bg + `0 4px 8px rgba(0,0,0,0.1)` shadow + `-translate-y-1` + hover blue bg

### Typography
- **Primary font**: Geist Sans (`var(--font-geist-sans)`), fallback to `system-ui, sans-serif`
- **Mono font**: Geist Mono (`var(--font-geist-mono)`)
- **Icon library**: `lucide-react` (already installed). Use for UI icons.
- Do NOT import FontAwesome — the project uses lucide-react instead.

### Public Assets (`/public/`)
All static files are served from `public/` at the root. Reference them as `/images/...`, `/pdfFiles/...`, etc.

**Images** (`public/images/`):
| File | Purpose |
|---|---|
| `WatsonTruckImage.jpg` | Watson Truck & Supply brand image |
| `WatsonHopperImage.jpg` | Watson Hopper Inc. brand image |
| `InsMgtServ.JPG` | IMS Managed Care (health insurance provider) logo |
| `AllisionTransImage.jpg`, `CumminsImage.jpg`, `DetroitDieselimage.jpg`, `Internationalimage.jpg` | Vendor/partner logos for public pages |
| `alex.jpg`, `maria.jpg`, `james.jpg`, `sophie.jpg` | Team member photos for `/team` page |

**PDFs** (`public/pdfFiles/`): Reference/display with `react-pdf` (already in package.json)
| File | Purpose |
|---|---|
| `2019 WTS Application.pdf` | Watson Truck & Supply employment application (paper version — digitized at `/careers/apply`) |
| `2019-Guardian-Dental-&-Vision-Benefits.pdf` | Guardian dental/vision plan summary — link from benefits enrollment |
| `2019-Insurance-Cost.pdf` | Insurance cost comparison sheet — link from benefits enrollment |
| `Job Description-US Field Mechanic.pdf` | Field mechanic job description — link from career hub |

**Enrollment PDFs** (`public/enrollmentApps/`): Pre-filled benefit election forms sent via BoldSign
| File | Purpose |
|---|---|
| `Employees-with-Health-Election.pdf` | Guardian life enrollment for employees who elected IMS health |
| `Employees-without-Health-Election.pdf` | Guardian life enrollment for employees who did NOT elect health |
| `Managers-with-Health-Election.pdf` | Manager variant — with health |
| `Managers-without-Health-Election.pdf` | Manager variant — without health |

**Videos** (`public/videos/`): Embedded on benefits enrollment pages
| File | Purpose |
|---|---|
| `IMS_RBP.mov` | IMS health plan explainer video (English) |
| `IMS_Spanish_RBP.mp4` | IMS health plan explainer video (Spanish) |

---

## Markdown Conventions

**No backslash-escaped whitespace** — do not use `\` before a space, tab, or at end of a line. Use a blank line for paragraph breaks. A pre-commit hook blocks any `.md` file containing this pattern.

---

## Watson Entity Structure — Critical Rule

Watson operates **three** distinct entities. Code, data, and UI must never mix their employee rosters, documents, or operational data.

| Entity | Type | Description | Key Contact |
|---|---|---|---|
| Watson Truck & Supply, Inc. | Primary | Truck sales, parts, service, field mechanics — Hobbs, NM | Jerry Elliott — 575-397-2411, jerryelliot@watsontruck.com |
| Watson Hopper Inc. | Subsidiary | Heavy-haul and oilfield hopper equipment operations | Mike Slaugh — ext.425, mslaugh@watsonhopper.com |
| Unit Shop, LLC | Subsidiary | Unit shop operations — same 1501 N Grimes address | Dale May — ext.335, dmay@watsontruck.com |

### Rules for all code and data decisions:
- Employees belong to exactly **one** `company_id` — never shared across entities
- Compliance alerts, incidents, and documents are scoped to their company
- The `companies` table is the root of all tenant data — always filter by `company_id`
- Benefits plans (IMS group health, Guardian life/dental/vision) are Watson Truck & Supply specific — do not assume they apply to Watson Hopper or Unit Shop without confirmation
- Reports and dashboards must always surface which entity the data belongs to
- RLS policies enforce `company_id` isolation at the database level

### Department Contact Directory (1501 N Grimes St, Hobbs, NM — main: 575-397-2411)

| Department | Contact | Extension | Email |
|---|---|---|---|
| Oil Field Supply & Int'l Parts | Bruce Dew | ext.227 | bdew@watsontruck.com |
| Watson Hopper | Mike Slaugh | ext.425 | mslaugh@watsonhopper.com |
| Unit Shop | Dale May | ext.335 | dmay@watsontruck.com |
| Truck Sales | Brad Hawkins | ext.401 | bhawkins@watsontruck.com |
| Truck Shop | Dan Wharff | ext.272 | dwharff@watsontruck.com |

### Plan / Group Numbers (for enrollment forms — hardcode these, do not make configurable):
- IMS Group Health — Watson Truck & Supply: **SWT0906**
- Guardian Life/Dental/Vision Group Plan: **00483632**

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **ORM**: Drizzle ORM — use Transaction Pooler, port **6543**, `prepare: false` required
- **Rate Limiting**: Upstash Redis (serverless, Edge-compatible)
- **Email**: Resend SDK — transactional email for compliance alerts, onboarding, notifications
- **E-Signatures**: BoldSign — employment applications, offer letters, benefits elections, salary redirection agreements
- **Workflow Automation**: n8n (self-hosted) — CDL expiry → alert → email chain; new hire → onboarding task assignment; incident logged → safety manager notification
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) — compliance assistant, risk scoring explanations, audit prep
- **Hosting**: Vercel (frontend)
- **Monorepo**: Turborepo (planned)
- **Integrations**: Plaid (bank verification + KYC IDV), PostHog (analytics), Sentry (error monitoring), Ocrolus (document parsing), Argyle (payroll/employment data)

---

## Build & Dev Commands

Run all commands from the **repository root** (where `package.json` lives).

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

### Database (Drizzle)
```bash
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Apply migrations to Supabase
npm run db:push       # Push schema directly (dev only — never in production)
npm run db:studio     # Open Drizzle Studio (local schema browser)
```

Requires `.env.local`. Copy from `.env.local.example` and fill in all values before running anything.

### Supabase local development
```bash
supabase start           # Start local Supabase stack
supabase db reset        # Reset and re-apply all migrations
supabase functions serve # Serve Edge Functions locally
supabase stop            # Stop local stack
```

---

## Environment Variables

All required. Never commit `.env.local`. See `.env.local.example` for the full list with descriptions.

---

## Database Rules

- All tables require: `id` (UUID, `defaultRandom()`), `created_at`, `updated_at`
- All tables require `company_id` FK — RLS enforces tenant isolation
- Use `prepare: false` on the Drizzle postgres client — required for Supabase Transaction Pooler
- Never use port 5432 (direct) or 6543 session pooler — Transaction Pooler on **6543** only
- Enums are defined in the schema and enforced at the DB level via `pgEnum`
- Optional FK fields (e.g. `locationId`, `cdlNumber`) must be coerced from empty string → `null` before insert/update
- Schema changes require a new migration via `npm run db:generate` — never edit deployed migrations
- Append-only for compliance records: `compliance_alerts`, `drug_tests`, `dot_violations` — never delete, only supersede
- `driver_risk_scores` stores a `json factors` column so the AI layer can explain score changes

### Tables implemented (Phase 1):

| Domain | Tables |
|---|---|
| Core | `companies`, `locations` |
| Workforce | `employees`, `employee_documents` |
| DOT Compliance | `cdl_certifications`, `medical_cards`, `drug_tests`, `dot_violations`, `compliance_alerts` |
| Safety | `vehicles`, `incidents`, `incident_photos`, `incident_root_causes`, `insurance_claims`, `driver_risk_scores` |
| Hiring | `job_postings`, `applicants`, `applications`, `applicant_documents`, `interviews`, `offer_letters` |
| Payroll/Benefits | `compensation`, `benefits_plans`, `employee_benefits`, `payroll_integrations`, `retirement_accounts` |

### RLS policy pattern (all tables):
```sql
-- Employees can only see their own company's data
CREATE POLICY "company_isolation" ON employees
  USING (company_id = (SELECT company_id FROM employees WHERE supabase_user_id = auth.uid()));
```

---

## DOT Compliance Rules — Critical Domain Knowledge

DOT compliance is the core differentiator of PowertrainOS. These rules must be reflected accurately in all alert generation, UI display, and AI assistant responses.

### Alert severity thresholds:
| Document | Critical | Warning |
|---|---|---|
| CDL | Expires ≤ 30 days | Expires 31–60 days |
| Medical card | Expires ≤ 30 days | Expires 31–60 days |
| Drug test (random) | Overdue | Due within 14 days |
| DOT violation | Open / unresolved | Pending documentation |

### Alert auto-generation:
- Run `POST /api/compliance` (the generate endpoint) on a schedule via n8n (daily at 6:00 AM MT)
- Alert generation is idempotent — uses `onConflictDoNothing()` to avoid duplicates
- Acknowledged alerts are excluded from the active count but retained for audit history
- `compliance_alerts` is append-only — never delete rows, only `acknowledged = true`

### Driver compliance status (used in UI color coding):
- **Green**: All certifications valid, no open alerts
- **Yellow**: Warning-level alerts (expiring within 30–60 days)
- **Red**: Critical alerts (expiring within 30 days, overdue tests, open violations)

### What fails a DOT audit:
- CDL expired or missing
- Medical card expired or missing
- Random drug test program not documented
- Post-accident drug/alcohol test not completed within 8 hours (alcohol) / 32 hours (drug)
- Unresolved violations without documented corrective action

---

## Benefits Reference Data

Watson Truck & Supply's actual benefit plans as of 2019 enrollment. These values seed the `benefits_plans` table and populate enrollment UI.

### Health Insurance (IMS Managed Care — Group SWT0906):
| Plan | Employee Only / mo | Employee + Spouse/Child/Family / mo |
|---|---|---|
| MEC Plan | $0.00 ($0/paycheck) | $155.00 ($71.54/paycheck) |
| Standard Plan | $175.50 ($81/paycheck) | $405.17 ($187/paycheck) |
| Buy Up Plan | $208.00 ($96/paycheck) | $481.00 ($222/paycheck) |

All plans include 15K life insurance. Bi-weekly payroll deduction.

### Dental (Guardian — Voluntary Indemnity):
| Coverage | Monthly | Per Paycheck |
|---|---|---|
| Employee Only | $28.36 | $13.09 |
| Employee + Spouse | $57.29 | $26.44 |
| Employee + Child(ren) | $68.25 | $31.50 |
| Employee + Family | $97.19 | $44.86 |

Deductible: $50/year. Preventive waived. Annual max $1,000 (rollover threshold $500, rollover amount $250). Any dentist (no network).

### Vision (Guardian — Voluntary Full Feature / VSP Choice):
| Coverage | Monthly | Per Paycheck |
|---|---|---|
| Employee Only | $7.97 | $3.68 |
| Employee + Spouse | $13.40 | $6.19 |
| Employee + Child(ren) | $13.67 | $6.31 |
| Employee + Family | $21.64 | $9.99 |

Exams: $10 co-pay in-network. Lenses: $25 co-pay. Frames: $130 retail + 20% off balance.

### Guardian Life Insurance (Group Plan 00483632):
- Two enrollment classes: employees enrolling in medical vs. not enrolling in medical
- Enrollment/change form: 4 pages (not enrolling in medical) or 6 pages (enrolling in medical)
- BoldSign templates required for both variants

### Life Insurance Tiers (AD&D policy amounts by class):
| Class | Basic Life AD&D |
|---|---|
| Owner | Highest tier |
| Manager | Mid tier |
| Employee | Base tier |

The `class` column on the `employees` table determines which tier applies.

---

## Benefits Enrollment Business Rules — Critical

These rules come from the legacy system and must be enforced in the enrollment wizard:

### Marital Status Routing
Enrollment flow branches based on `employees.marital_status`:
- `married` → Spouse enrollment → Group Health → Life Insurance → Salary Redirection
- `married_with_dependents` → Spouse + Dependent enrollment → Group Health → Life Insurance → Salary Redirection
- `single_with_dependents` → Dependent enrollment (no spouse step) → Group Health → Life Insurance → Salary Redirection
- `single` → Group Health → Life Insurance → Salary Redirection (skip all family steps)

### Plan Selection Rules
- IMS health plan selection is **mutually exclusive**: NoMedical / MEC / Standard / BuyUp — only one can be active
- Dental and vision are independent voluntary elections
- Employee can refuse dental/vision with a documented reason (required field)

### Beneficiary Rules
- Primary beneficiaries' percentages must total exactly 100%
- Contingent beneficiaries are a separate pool — their percentages must also total 100%
- Both Primary and Contingent can coexist on the same employee record
- Beneficiaries are tied to the life insurance enrollment, not the employee directly

### Deduction Categories (Salary Redirection — 10 categories)
Each has a pre-tax/post-tax flag and a premium amount:
1. Medical
2. Dental
3. Vision
4. Accident
5. Cancer
6. Short-Term Disability
7. Hospital Indemnity
8. Term Life
9. Whole Life
10. Other

### Duplicate Enrollment Prevention
- Check for existing group health / life insurance record before creating new
- Return error "Record already exists" if found — do not silently overwrite

### Cascade Delete Order
When deleting an employee, cascade must follow this order to avoid FK violations:
1. Beneficiaries
2. Deductions
3. Other insurance records
4. Family members (spouse, dependents)
5. Life insurance enrollment
6. Group health enrollment
7. Employee record

Use `onDelete: 'cascade'` on all FK references in Drizzle schema.

---

## Watson Employment Application — Field Reference

The paper application (digitized into `/hiring/apply`) has these sections. All fields map to the `applicants` and `applications` tables or the `applicant_documents` storage bucket.

**Applicant's Statement**: Legal acknowledgment — displayed as read-only text with e-signature via BoldSign.

**Personal Data**:
- Name, SSN (encrypted at rest, never logged), address (present + previous), how long at each, phone, age 18+ confirmation, prior Watson employment, driver's license (yes/no, state, number, expiration)

**Education**: Elementary, High School, College/Univ., Bus./Tech., Additional — each: institution name, years completed, field of study, degree

**Military**: Veteran (yes/no), duty/specialized training

**Record of Previous Employment**: 4 employer blocks — employer name, phone, address, city/state/zip, employed from/to, title, work performed, supervisor(s)

**Termination history**: Ever terminated/asked to resign (yes/no, explanation), gaps in employment history

**References**: 3 blocks — name, phone, address, city/state/zip, occupation, years known

**General Information — Experience checkboxes**:
Service Writer, Machinist, Mechanic, Mechanic Helper, Welder, Welder Helper, Painter, Porter, Janitor, Parts Clerk, Parts Delivery, Truck Sales, Accounts Receivable, Accounts Payable, Clerk, Receptionist, Secretary, Other

**Certifications**: Free text field

**Final certification + signature**: Date + applicant signature (BoldSign)

---

## User Roles & Permissions

| Role | Access |
|---|---|
| `super_admin` | All companies, all features, user management |
| `admin` | Own company — full CRUD all modules, user invite |
| `manager` | Own team — CRUD workforce, read-only compliance, incident reporting |
| `driver` | Own profile + documents + compliance status only |
| `employee` | Own profile + benefits enrollment + pay stubs only |

Roles are stored on the `employees` table (`role` enum column). Auth is Supabase; role enforcement is via RLS + middleware.

**Middleware route guards**:
- `/dashboard/*`, `/workforce/*`, `/compliance/*`, `/safety/*`, `/hiring/*`, `/benefits/*`, `/ai/*` → require authenticated session → redirect `/auth/login`
- `/auth/*` → redirect `/dashboard` if already authenticated
- `/api/*` → rate limit before auth check

---

## API Route Patterns

All API routes follow this exact order:

```typescript
// 1. Rate limit (by IP for public, by user ID for authenticated)
const { success } = await apiRateLimit.limit(identifier)
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

// 2. Authenticate
const user = await requireServerUser() // throws 'Unauthorized' if no session

// 3. Validate request body (POST/PUT only)
const parsed = schema.safeParse(await request.json())
if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

// 4. Execute DB operation (Drizzle)

// 5. Return response
return NextResponse.json(result, { status: 201 })
```

All errors are caught and return `{ error: string }` with appropriate HTTP status. Never expose stack traces or internal error messages to the client.

### Coerce empty strings to null before DB writes:
```typescript
const updateData = {
  ...parsed.data,
  locationId: parsed.data.locationId || null,
  cdlNumber:  parsed.data.cdlNumber  || null,
  cdlState:   parsed.data.cdlState   || null,
}
```

---

## Drizzle ORM Patterns

```typescript
// Always use Transaction Pooler — prepare: false is mandatory
const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 })
export const db = drizzle(client, { schema })

// Filtering with conditions array
const conditions = []
if (status) conditions.push(eq(employees.status, status as EmployeeStatus))
if (role)   conditions.push(eq(employees.role,   role   as UserRole))
const results = await db.select().from(employees)
  .where(conditions.length > 0 ? and(...conditions) : undefined)

// Upsert pattern (idempotent alert generation)
await db.insert(complianceAlerts).values(alertsToCreate).onConflictDoNothing()
```

---

## Supabase Client Usage

```typescript
// Server Components, API routes, middleware:
import { createSupabaseServerClient } from '@/lib/supabase/client'

// Client Components:
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// API routes needing service role (storage, admin ops):
import { createSupabaseAdminClient } from '@/lib/supabase/client'

// Never use service role key in client components or expose it to the browser
```

---

## n8n Automation Triggers

These workflows fire from API routes via `POST` to `N8N_WEBHOOK_URL`. Each trigger sends a `type` + `payload`.

| Trigger | Fires from | n8n action |
|---|---|---|
| `cdl.expiring` | Compliance alert generation (daily) | Email driver + manager, create task |
| `medical_card.expiring` | Compliance alert generation (daily) | Email driver + manager |
| `drug_test.due` | Compliance alert generation (daily) | Email driver, notify safety manager |
| `employee.hired` | POST /api/employees | Assign onboarding checklist, send welcome email |
| `incident.created` | POST /api/safety | Notify safety manager + admin, create investigation task |
| `application.submitted` | Public hiring form | Notify hiring manager, send confirmation to applicant |
| `offer.signed` | BoldSign webhook | Trigger employee record creation, start onboarding |

---

## BoldSign Document Templates

| Template | Env var | Signers |
|---|---|---|
| Employment application | `BOLDSIGN_TEMPLATE_EMPLOYMENT_APPLICATION` | Applicant |
| Offer letter | `BOLDSIGN_TEMPLATE_OFFER_LETTER` | Applicant + HR |
| Salary redirection agreement | `BOLDSIGN_TEMPLATE_SALARY_REDIRECTION` | Employee + employer |
| Benefits election | `BOLDSIGN_TEMPLATE_BENEFITS_ELECTION` | Employee |
| Guardian life enrollment | `BOLDSIGN_TEMPLATE_GUARDIAN_LIFE` | Employee |
| IMS health enrollment | `BOLDSIGN_TEMPLATE_IMS_HEALTH` | Employee |

All BoldSign webhooks hit `/api/webhooks/boldsign`. Validate `BOLDSIGN_WEBHOOK_SECRET` on every inbound request before processing.

---

## AI Assistant (Claude API)

The AI assistant lives at `/ai` and proxies to `/api/ai`. It uses `aiRateLimit` (20 req/60s).

**System prompt context injected per request**:
- Authenticated user's role and company
- Current compliance alert counts by severity
- Current open incident count
- Today's date (for relative date reasoning)

**Intended query types**:
- "Which drivers are at risk of DOT violations in the next 30 days?"
- "Who is missing documentation for an upcoming audit?"
- "What would fail a DOT audit today?"
- "Explain why this driver's risk score dropped"

**Hard rules**:
- Never expose SSNs, full financial data, or other PII in AI responses
- Never allow the AI to write to the database — read-only context only
- Always include a disclaimer that AI responses are advisory and not legal compliance advice

---

## Testing Expectations

- **Unit**: DOT alert generation logic, compliance rate calculations, risk score factor weighting
- **Integration**: API route auth + rate limiting, Supabase RLS policies, Drizzle query correctness
- **E2E**: Employee hire → onboarding checklist, CDL expiry → alert → email chain, incident report → investigation task

Tests must verify **state transitions** (e.g., alert `acknowledged: false` → `true`), not only return values.

---

## Security Rules

- RLS policies on every table — always filter by `company_id`
- Middleware enforces auth before all dashboard and API routes
- Rate limiting runs before auth on every API call
- BoldSign webhook signature must be validated before processing
- n8n webhook must validate `N8N_WEBHOOK_SECRET` HMAC on every inbound call
- SSNs stored encrypted at rest via Supabase Vault — never log, never return in API responses
- Service role key used only in admin server-side operations — never in client components
- Sentry captures all unhandled API errors — never expose raw error messages to clients

---

## Implementation Phasing

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Project setup, schema, auth, workforce hub, DOT compliance engine, compliance dashboard | Complete |
| **Phase 2** | Safety & incident tracking, hiring ATS, digital employment application, benefits enrollment wizard | In Progress |
| **Phase 3** | AI compliance assistant, driver risk scoring, n8n automation, BoldSign e-signatures, Resend email notifications | Planned |
| **Phase 4** | Payroll integrations (Gusto/ADP/Paychex), Plaid bank verification, Argyle payroll data, Ocrolus document parsing | Planned |
| **Phase 5** | Insurance optimization analytics, PostHog product analytics, external partner integrations | Planned |
