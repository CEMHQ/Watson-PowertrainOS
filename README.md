# Watson PowertrainOS

Fleet workforce and compliance operating system for **Watson Truck & Supply, Inc.** and its subsidiary **Watson Hopper Inc.** (Hobbs, NM).

Manages the full employee lifecycle — hiring, onboarding, DOT compliance tracking, safety incident management, benefits enrollment, and workforce analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL · Drizzle ORM |
| Rate Limiting | Upstash Redis (optional — no-ops gracefully if unconfigured) |
| Email | Resend |
| E-Signatures | BoldSign |
| AI | Anthropic Claude API |
| Automation | n8n (self-hosted) |
| Hosting | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in the required values in `.env.local`:

| Variable | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Settings → API |
| `DATABASE_URL` | Yes | Supabase → Settings → Database → Transaction Pooler (port 6543) |
| `UPSTASH_REDIS_REST_URL` | Optional | console.upstash.com |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | console.upstash.com |
| `RESEND_API_KEY` | Phase 3 | resend.com |
| `ANTHROPIC_API_KEY` | Phase 3 | console.anthropic.com |

> Rate limiting is automatically disabled when Upstash credentials are absent — all API routes still function normally.

### 3. Apply database migrations

```bash
npm run db:migrate
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/
    (public)/       # Unauthenticated: /, /about, /contact, /team, /careers
    (dashboard)/    # Requires auth: /dashboard, /workforce, /compliance, /safety, /hiring, /ai
    auth/           # /auth/login
    api/            # All API routes
  components/       # Shared UI components
  db/schema/        # Drizzle schema (source of truth)
  lib/              # Drizzle client, Supabase clients, Redis, utils
```

Key conventions:
- Server-only Supabase client: `@/lib/supabase/server`
- Browser Supabase client: `@/lib/supabase/client`
- All API routes: rate limit → auth → validate (Zod) → Drizzle → response
- UI patterns: see `CLAUDE_UI.md`

---

## Development Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Generate Drizzle migration from schema changes
npm run db:migrate   # Apply migrations to Supabase
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio
```

---

## Module Status

| Module | Routes | Status |
|---|---|---|
| Auth | `/auth/login` | Complete |
| Workforce Hub | `/workforce`, `/workforce/[id]` | Complete |
| DOT Compliance Engine | `/compliance`, `/api/compliance` | Complete |
| Safety & Incident Tracking | `/safety`, `/safety/new`, `/safety/[id]` | Complete |
| Public Site | `/`, `/about`, `/contact`, `/team`, `/careers` | Complete |
| Hiring ATS | `/hiring`, `/hiring/[id]` | In Progress |
| Benefits Enrollment | `/benefits/[id]/*` | In Progress |
| AI Compliance Assistant | `/ai` | Planned |
| Driver Risk Scoring | Automated | Planned |
| n8n Workflow Automation | Webhooks | Planned |

---

## Watson Entity Structure

All data is scoped to a `company_id`. The two entities must never share employee rosters, documents, or operational data:

| Entity | Description |
|---|---|
| **Watson Truck & Supply, Inc.** | Truck sales, parts, service, field mechanics — Hobbs, NM |
| **Watson Hopper Inc.** | Heavy-haul and oilfield hopper equipment operations |

---

## Database Notes

- Use Transaction Pooler (port **6543**), never direct connection (5432)
- `prepare: false` is required on the Drizzle postgres client
- All tables require `id` (UUID), `created_at`, `updated_at`, and `company_id`
- Compliance records (`compliance_alerts`, `drug_tests`, `dot_violations`) are append-only — never delete rows
- Schema changes: `npm run db:generate` then `npm run db:migrate`
