# UI/UX Redesign (User Flows & Dashboards) — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin all authenticated pages (auth, onboarding, dashboards) to match the new design system (Space Grotesk + Inter, glassmorphic cards, animated dark theme), add missing features (SavedEvent, Alerts feed, forgot password UI), and apply schema migrations.

**Architecture:** The auth, onboarding, candidate dashboard, company dashboard, and admin dashboard all ALREADY EXIST and are functional. This plan is primarily a visual reskin with targeted new features. Schema migrations add SavedEvent model and job detail fields. All existing API routes and business logic remain unchanged unless explicitly noted.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (CSS-based config), shadcn/ui v4 (base-nova), Lucide icons, next-intl, Space Grotesk + Inter + Noto Sans fonts, Prisma + SQLite, NextAuth, Recharts

**Spec:** `docs/superpowers/specs/2026-03-16-ui-ux-redesign-design.md` (sections 3.7–3.11)

**Branch:** `feat/ui-ux-redesign-v2` (continue on same branch)

**Design System Reference (already implemented in Plan A):**
- Background: `oklch(0.07 0.01 260)`, animated orbs/grid/particles via `<AnimatedBackground />`
- Cards: `rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px]`
- Headlines: `font-display` (Space Grotesk), body: `font-sans` (Inter + Noto Sans)
- Primary: `oklch(0.88 0.27 128)` (neon green)
- Inputs: `rounded-[14px] border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]` with `focus:border-primary/30 focus:ring-1 focus:ring-primary/20`
- Buttons primary: `bg-primary text-primary-foreground rounded-lg`
- Chips: `rounded-full border-white/[0.06] bg-white/[0.02] text-white/[0.45]`, active: `border-primary/[0.25] bg-primary/[0.05] text-primary`
- Page titles: `font-display text-[42px] font-bold tracking-[-0.03em]`
- Section headers: `font-display text-2xl font-semibold tracking-tight`
- Muted text: `text-white/[0.35]` or `text-white/30`

---

## Important Notes for Implementers

1. **All pages already exist and work.** You are reskinning, not rebuilding. Read the current file FIRST, then update styling. Do NOT rewrite business logic, API calls, or state management unless the task explicitly says to.
2. **Reuse the design system patterns** from Plan A (listed above). Don't invent new patterns.
3. **Font classes:** `font-display` = Space Grotesk (headlines, stats, titles). Default body text uses Inter via `font-sans`. No explicit class needed for body text.
4. **Greek locale:** English-first. Marketing copy in English, UI labels in Greek. Already configured.
5. **The animated background is already rendered** in the locale layout. No need to add it to individual pages.
6. **Existing shadcn/ui components** (Button, Input, Card, Tabs, Dialog, etc.) are already installed. Use them but override styles with Tailwind classes to match the design system.

---

## Chunk 1: Schema Migrations

### Task 1: Add SavedEvent model and job detail fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add SavedEvent model**

Add after the `EventRegistration` model:
```prisma
model SavedEvent {
  id      String   @id @default(cuid())
  userId  String
  eventId String
  savedAt DateTime @default(now())
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event   Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
}
```

Add `savedEvents SavedEvent[]` relation to the `User` model.
Add `savedBy SavedEvent[]` relation to the `Event` model.

- [ ] **Step 2: Add lastSeenAlertsAt to CandidateProfile**

Add to `CandidateProfile`:
```prisma
lastSeenAlertsAt DateTime?
```

- [ ] **Step 3: Add job detail fields to JobListing**

Add optional fields to `JobListing`:
```prisma
description    String?
requirements   String?   // JSON array of strings
techStack      String?   // JSON array of strings
experienceLevel String?
```

- [ ] **Step 4: Run migration**

```bash
cd /home/ubuntu/people_in_tech && npx prisma db push
```

- [ ] **Step 5: Add SavedEvent API route**

Create `src/app/api/events/[id]/save/route.ts` — same pattern as `src/app/api/jobs/[id]/save/route.ts`:
- POST: Toggle save/unsave for authenticated user
- Returns `{ saved: boolean }`

- [ ] **Step 6: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/app/api/events/[id]/save/
git commit -m "feat(schema): add SavedEvent model, lastSeenAlertsAt, job detail fields"
```

---

## Chunk 2: Auth Pages Reskin

### Task 2: Redesign Sign In page

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/app/[locale]/(auth)/login/page.tsx`

- [ ] **Step 1: Update login page layout**

The login page server component should set a clean centered layout. Update to render the form inside a centered container with the "Hiring." logo above.

- [ ] **Step 2: Update LoginForm styling**

Apply the design system to the login form:
- Container: `max-w-[400px] w-full` centered
- Logo at top: `font-display text-2xl font-bold text-foreground tracking-tight` with green dot
- Title: `font-display text-[24px] font-bold text-foreground`
- Subtitle: `text-[15px] text-white/[0.35]`
- "Continue with LinkedIn" button: `w-full rounded-[10px] border-white/[0.08] bg-white/[0.03] text-white/50` — disabled with "(Coming soon)" text
- Divider: "or" text between horizontal lines
- Inputs: Use design system input styling (rounded-[14px], bg-white/[0.03], etc.)
- Submit button: primary full width
- "Don't have an account? Sign Up" link at bottom
- "Forgot password?" link below submit button (links to `/forgot-password` — just a link, page comes in Task 4)

Keep ALL existing form logic (react-hook-form, zod, signIn, error handling, redirects).

- [ ] **Step 3: Build and verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/ src/app/[locale]/(auth)/login/
git commit -m "feat(auth): redesign sign in page with new design system"
```

---

### Task 3: Redesign Sign Up page

**Files:**
- Modify: `src/components/auth/register-form.tsx`
- Modify: `src/app/[locale]/(auth)/register/page.tsx`

- [ ] **Step 1: Update RegisterForm styling**

Same visual pattern as login:
- "Create Account" title
- LinkedIn button (disabled, coming soon)
- Divider
- Name, email, password inputs with design system styling
- Terms checkbox or notice text
- "Get Started" primary button
- "Already have an account? Sign In" link

Keep ALL existing logic.

- [ ] **Step 2: Build and verify**

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/ src/app/[locale]/(auth)/register/
git commit -m "feat(auth): redesign sign up page with new design system"
```

---

### Task 4: Create Forgot Password UI (3-step)

**Files:**
- Create: `src/app/[locale]/(auth)/forgot-password/page.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`

- [ ] **Step 1: Create forgot password form**

Client component with 3 steps (all UI only — no actual email sending for MVP):

Step 1: Enter email → "Send Reset Link" button → moves to step 2
Step 2: "Check your email" confirmation with email icon, "Resend" link
Step 3: "Set new password" form (new + confirm) → "Reset Password" button → shows success → link to sign in

All styling matches the auth design system. State managed with useState for step transitions.

- [ ] **Step 2: Create page route**

Server component that renders ForgotPasswordForm.

- [ ] **Step 3: Build and verify**

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/(auth)/forgot-password/ src/components/auth/
git commit -m "feat(auth): add forgot password UI flow (3-step)"
```

---

## Chunk 3: Onboarding Reskin

### Task 5: Redesign Onboarding Wizard

**Files:**
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Modify: `src/components/onboarding/step-about.tsx`
- Modify: `src/components/onboarding/step-interests.tsx`
- Modify: `src/components/onboarding/step-preferences.tsx`

- [ ] **Step 1: Update wizard container and progress indicator**

Update the wizard wrapper:
- Centered container `max-w-[520px]`
- Progress bar: thin line with green fill (not dots) — `h-1 rounded-full bg-white/[0.06]` with green fill div
- Step title: `font-display text-[24px] font-bold`
- Step subtitle: `text-[15px] text-white/[0.35]`

- [ ] **Step 2: Update Step 1 (About) styling**

- Inputs: design system styling
- Experience level: 3 glassmorphic cards instead of buttons, with icon + title + description
- Preserve all validation logic

- [ ] **Step 3: Update Step 2 (Interests) styling**

- Role interests: rounded-full chip pills with design system active/inactive styles
- Skills input: design system input with tag pills
- Industries: same chip pills
- Preserve all logic

- [ ] **Step 4: Update Step 3 (Preferences) styling**

- Location chips: rounded-full pills
- Email toggles: cleaner toggle switch styling
- Language: two glassmorphic cards (EN/EL)
- "Start Exploring →" primary button

- [ ] **Step 5: Build and verify**

- [ ] **Step 6: Commit**

```bash
git add src/components/onboarding/
git commit -m "feat(onboarding): redesign wizard with glassmorphic cards and new styling"
```

---

## Chunk 4: Candidate Dashboard

### Task 6: Redesign Dashboard Header and Stats

**Files:**
- Modify: `src/components/dashboard/candidate/dashboard-client.tsx`

- [ ] **Step 1: Add welcome header and stats row**

Before the tabs, add:
- Welcome: `font-display text-[28px] font-bold` + "Welcome back, {name}"
- Stats row: 4 glassmorphic cards in a grid
  - Saved Companies (count from followed companies)
  - Saved Jobs (count)
  - New Alerts (computed: count of new jobs/events from followed companies since lastSeenAlertsAt)
  - Saved Events (count — will be 0 until SavedEvent feature is wired)
- Card style: `rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5`
- Number: `font-display text-2xl font-bold text-primary`
- Label: `text-xs text-white/30`

- [ ] **Step 2: Update tab bar styling**

Use the same tab styling as company profile:
- `text-[13px] font-medium text-white/40`
- Active: `text-primary border-b-2 border-primary`
- Add two new tabs: "Alerts" and "Saved Events"

- [ ] **Step 3: Build and verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/candidate/
git commit -m "feat(dashboard): redesign header with stats row and updated tabs"
```

---

### Task 7: Redesign Existing Dashboard Tabs

**Files:**
- Modify: `src/components/dashboard/candidate/followed-companies.tsx`
- Modify: `src/components/dashboard/candidate/saved-jobs.tsx`
- Modify: `src/components/dashboard/candidate/profile-settings.tsx`

- [ ] **Step 1: Update Followed Companies tab**

- Use 3-column grid of mini company cards (reuse CompanyCard from shared)
- Unfollow button: subtle outline style
- Empty state: glassmorphic card with icon + text + CTA button

- [ ] **Step 2: Update Saved Jobs tab**

- Vertical list using JobCard component (already redesigned)
- Empty state matching design system

- [ ] **Step 3: Update Settings tab to two-column layout**

Left column: Profile form (name, email disabled, LinkedIn, experience level)
Right column: Preferences (industry chips, location chips, notification toggles, delete account button)

All using design system input/chip/toggle styles.

- [ ] **Step 4: Build and verify**

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/candidate/
git commit -m "feat(dashboard): redesign followed companies, saved jobs, settings tabs"
```

---

### Task 8: Add Alerts Tab

**Files:**
- Create: `src/components/dashboard/candidate/alerts-tab.tsx`
- Modify: `src/components/dashboard/candidate/dashboard-client.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`

- [ ] **Step 1: Update server component to fetch alerts data**

In the dashboard page server component, add a query for alerts:
- Fetch followed company IDs
- Query new JobListings from those companies (postedAt after user's lastSeenAlertsAt or last 30 days)
- Query new Events from those companies (createdAt after lastSeenAlertsAt or last 30 days)
- Combine and sort by date descending
- Pass as `alerts` prop to DashboardClient

- [ ] **Step 2: Create AlertsTab component**

Activity feed with:
- Green dot (new) / gray dot (seen) based on `lastSeenAlertsAt`
- "[Company] posted a new role: [Title]" or "[Company] is hosting: [Event]"
- Relative timestamp
- "View →" button linking to job detail or external event URL
- Mark all as read button (updates `lastSeenAlertsAt` via API call)
- Empty state when no alerts

- [ ] **Step 3: Add API route for marking alerts as read**

Create `src/app/api/candidate/alerts/read/route.ts`:
- POST: Update `lastSeenAlertsAt` to now() on CandidateProfile

- [ ] **Step 4: Wire into dashboard tabs**

Add "Alerts" tab to DashboardClient, render AlertsTab.

- [ ] **Step 5: Build and verify**

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/candidate/ src/app/[locale]/(main)/dashboard/ src/app/api/candidate/alerts/
git commit -m "feat(dashboard): add alerts tab with activity feed from saved companies"
```

---

### Task 9: Add Saved Events Tab

**Files:**
- Create: `src/components/dashboard/candidate/saved-events-tab.tsx`
- Modify: `src/components/dashboard/candidate/dashboard-client.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`

- [ ] **Step 1: Update server component to fetch saved events**

Query SavedEvent records for the user, include event data with company.

- [ ] **Step 2: Create SavedEventsTab component**

List of saved events using EventCard component (already redesigned).
- Unsave button on each
- Empty state with link to `/events`

- [ ] **Step 3: Wire into dashboard**

Add "Saved Events" tab.

- [ ] **Step 4: Add save button to event cards on events page**

Update `src/components/events/events-client.tsx` — replace the "Register" button with a "Save Event" bookmark toggle (same pattern as job save).

- [ ] **Step 5: Build and verify**

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/candidate/ src/app/[locale]/(main)/dashboard/ src/components/events/
git commit -m "feat(dashboard): add saved events tab with save/unsave on event cards"
```

---

## Chunk 5: Company Dashboard Reskin

### Task 10: Redesign Company Dashboard Layout and Overview

**Files:**
- Modify: `src/components/dashboard/company/dashboard-client.tsx`
- Modify: `src/components/dashboard/company/overview.tsx`

- [ ] **Step 1: Update dashboard sidebar layout**

Apply design system to the sidebar:
- Width: 220px fixed on desktop
- Background: `bg-white/[0.02] border-r border-white/[0.04]`
- Nav items: `text-[13px] text-white/40`, active: `text-primary bg-primary/[0.05]`
- Company name/logo at top of sidebar

- [ ] **Step 2: Update Overview tab**

- Stats cards: glassmorphic style
- Follower growth chart: update Recharts colors to match theme (green primary line, dark grid)
- Recent activity: glassmorphic list items

- [ ] **Step 3: Build and verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/company/
git commit -m "feat(company-dashboard): redesign sidebar and overview with new design system"
```

---

### Task 11: Redesign Company Dashboard Forms

**Files:**
- Modify: `src/components/dashboard/company/profile-editor.tsx`
- Modify: `src/components/dashboard/company/job-manager.tsx`
- Modify: `src/components/dashboard/company/event-manager.tsx`
- Modify: `src/components/dashboard/company/gallery-manager.tsx`
- Modify: `src/components/dashboard/company/analytics.tsx`

- [ ] **Step 1: Update Profile Editor**

Apply design system to all form sections (inputs, dropdowns, tag inputs, image previews).

- [ ] **Step 2: Update Job Manager**

- Table: glassmorphic container, `text-[13px]` text
- Form dialog: design system inputs
- Status badges: colored pills

- [ ] **Step 3: Update Event Manager**

Same pattern as job manager.

- [ ] **Step 4: Update Gallery Manager**

- Image grid: glassmorphic cards
- Upload form: design system input

- [ ] **Step 5: Update Analytics**

- Chart colors to match theme
- Stats cards: glassmorphic

- [ ] **Step 6: Build and verify**

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/company/
git commit -m "feat(company-dashboard): redesign all dashboard tabs with new design system"
```

---

## Chunk 6: Admin Dashboard Reskin

### Task 12: Redesign Admin Dashboard Layout

**Files:**
- Modify: `src/components/admin/admin-dashboard-client.tsx`
- Modify: `src/components/admin/overview.tsx`

- [ ] **Step 1: Update admin sidebar**

Same pattern as company dashboard sidebar:
- 220px fixed width
- Glassmorphic background
- Nav items with icons, `text-[13px]`
- Pending claims badge: `bg-primary/[0.1] text-primary rounded-full px-2`

- [ ] **Step 2: Update Overview**

- KPI cards: glassmorphic with `font-display` numbers
- Pending claims alert: `border-primary/[0.08] bg-primary/[0.03]`
- Charts: theme-matched colors
- Top companies table: glassmorphic

- [ ] **Step 3: Build and verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): redesign sidebar and overview with new design system"
```

---

### Task 13: Redesign Admin CRUD Tables

**Files:**
- Modify: `src/components/admin/companies-table.tsx`
- Modify: `src/components/admin/candidates-table.tsx`
- Modify: `src/components/admin/claims-queue.tsx`
- Modify: `src/components/admin/jobs-table.tsx`
- Modify: `src/components/admin/events-manager.tsx`
- Modify: `src/components/admin/newsletter-composer.tsx`
- Modify: `src/components/admin/analytics-dashboard.tsx`

- [ ] **Step 1: Update Companies table**

- Glassmorphic container
- Table header: `text-[11px] uppercase tracking-wider text-white/30`
- Table rows: `border-b border-white/[0.04]`
- Status badges: colored pills
- Action buttons: subtle outline style

- [ ] **Step 2: Update Candidates table**

Same table pattern.

- [ ] **Step 3: Update Claims Queue**

- Glassmorphic claim cards
- Approve/Reject buttons: green primary / outline destructive

- [ ] **Step 4: Update Jobs table**

Same table pattern.

- [ ] **Step 5: Update Events Manager**

Same pattern.

- [ ] **Step 6: Update Newsletter Composer**

- Glassmorphic form container
- Preview panel: glassmorphic
- Design system inputs

- [ ] **Step 7: Update Analytics Dashboard**

- Charts: theme colors
- Stats cards: glassmorphic

- [ ] **Step 8: Build and verify**

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): redesign all CRUD tables and forms with new design system"
```

---

## Chunk 7: Final Verification

### Task 14: Full Build and Cross-Check

- [ ] **Step 1: Run full build**

```bash
cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -15
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Cross-check every page against the spec**

Start dev server and check each page:
- `/login` — sign in form matches spec 3.7
- `/register` — sign up form matches spec 3.7
- `/forgot-password` — 3-step flow works
- `/onboarding` — wizard matches spec 3.7 step 2
- `/dashboard` — candidate dashboard matches spec 3.8 (5 tabs, stats row, alerts, saved events)
- Company dashboard — matches spec 3.11 (sidebar, all tabs)
- Admin dashboard — matches spec 3.10 (sidebar, all sections)
- Font rendering: Inter for body, Space Grotesk for headlines, Noto Sans for Greek
- Animated background visible on all pages
- Mobile responsive

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Commit fixes**

```bash
git add -A
git commit -m "fix: visual polish and responsive adjustments for user flows"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1. Schema | 1 | SavedEvent model, job detail fields, alerts timestamp |
| 2. Auth | 2–4 | Redesigned sign in/up, forgot password UI |
| 3. Onboarding | 5 | Redesigned wizard with glassmorphic cards |
| 4. Candidate Dashboard | 6–9 | Stats row, reskinned tabs, new Alerts + Saved Events |
| 5. Company Dashboard | 10–11 | Reskinned sidebar, overview, all forms |
| 6. Admin Dashboard | 12–13 | Reskinned sidebar, overview, all CRUD tables |
| 7. Verification | 14 | Full build + cross-check against spec |

**Parallelization notes:**
- Chunk 1 (schema) must go first — other chunks depend on new models
- Chunks 2, 3, 5, 6 are independent of each other (different page groups)
- Chunk 4 depends on Chunk 1 (SavedEvent, alerts) but Tasks 6-7 can start before Task 1 finishes
- Chunk 7 must be last
