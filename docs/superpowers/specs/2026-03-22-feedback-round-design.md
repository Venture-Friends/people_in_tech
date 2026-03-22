# Feedback Round — Design Spec

**Date:** 2026-03-22
**Status:** Approved

## Overview

This spec covers all feedback collected via the feedback widget (11 items) plus conversation feedback about company rep profiles and context switching. Work is organized into 4 groups executed in order: C (quick fixes) → B (admin improvements) → A (rep profiles & switching) → D (landing page polish).

---

## Group C — Quick Fixes

### C1: Sort Dropdown Label Bug (Discover Page)

**Problem:** The `SelectValue` in `sort-dropdown.tsx` renders the raw `value` prop ("mostFollowed") instead of the translated label ("Most Followed").

**Fix:** Ensure `SelectValue` displays the translated child text of the selected `SelectItem`, not the internal value. The translations in `en.json` are already correct (`sortMostFollowed: "Most Followed"`, `sortRecent: "Recently Added"`, etc.).

**Files:** `src/components/discover/sort-dropdown.tsx`

### C2: Sort Dropdown Selected Value Bug (Discover Page)

**Problem:** Selecting "Recently Added" displays as "recent" instead of the full label.

**Fix:** Same root cause as C1 — the `SelectValue` shows the `value` prop instead of the label. Fixed together with C1.

**Files:** `src/components/discover/sort-dropdown.tsx`

### C3: Event Card Date Box Inconsistent Sizing (Events Page)

**Problem:** The date block in `event-card.tsx` uses `min-w-[56px] min-h-[56px]` but no fixed dimensions. Different month abbreviations (e.g. "MAR" vs "JUN") cause slightly different box sizes across cards.

**Fix:** Set fixed `w-[56px] h-[56px]` on the date block container to ensure uniform sizing regardless of content.

**Files:** `src/components/shared/event-card.tsx`

### C4: Missing User in Admin Candidates List

**Problem:** User registered with `fratzeskos.nikolas@gmail.com` but doesn't appear in admin candidates table. Likely cause: the candidates API only returns users who have a `CandidateProfile` record (created during onboarding). Users who registered but didn't complete onboarding are invisible.

**Fix:** Admin candidates table should query the `User` table with an optional `CandidateProfile` join (LEFT JOIN). Show ALL registered users with an "Onboarding Complete" status indicator. Users without a `CandidateProfile` show as "Pending Onboarding."

**Files:** `src/app/api/admin/candidates/route.ts`, `src/components/admin/candidates-table.tsx`

---

## Group B — Admin Dashboard Improvements

### B1: Full Company Profile Editing from Admin

**Current state:** Admin edit dialog only has: name, industry, website, description. Missing: logo, cover image, LinkedIn, size, founded, locations, technologies, careers URL.

**Design:** Replace the small edit dialog with a full-page **slide-over panel** (Sheet component) with sections:

- **Basic Info:** Name, Industry, Size, Founded, Description
- **Links:** Website, LinkedIn URL, Careers Page URL
- **Media:** Logo URL, Cover Image URL
- **Details:** Locations (multi-select), Technologies (multi-select)
- **Status:** Featured toggle, Company status display

**Auto-enrichment flow:** When the admin submits a company URL:
1. Attempt to auto-populate fields from the URL (enrichment)
2. If enrichment succeeds partially, pre-fill what was found and clearly indicate which fields still need manual input
3. If enrichment fails entirely, show a message explaining what went wrong and prompt for manual entry

**API:** Reuses `PUT /api/admin/companies/[id]`, extended to accept all Company model fields.

**Files:** `src/components/admin/companies-table.tsx` (new Sheet-based editor), `src/app/api/admin/companies/[id]/route.ts`

### B2: Job Scraping — Verify & Improve

**Current state:** Schema has `careersUrl` on Company and `JobScrapeLog` model. `JobScraperPanel` component and `scrape-jobs` API route exist. Needs end-to-end verification.

**Design — Three scraping sources:**

1. **Careers page URL** — Admin finds and provides the company's actual careers page URL. Scraper targets that page specifically rather than trying to discover it from the main website.
2. **LinkedIn company page** — Admin provides the LinkedIn company page URL. Scraper navigates to the Jobs section and scrapes any listings the company has posted.
3. **Manual entry** — Always available as fallback. Admin manually creates a job listing with title, location, type, external URL, etc. Even if it links to an external application page.

**Workflow:**
1. Admin adds careers URL and/or LinkedIn URL to company profile (via B1 slide-over panel)
2. Admin clicks "Scan Jobs" → selects source (Careers page or LinkedIn)
3. Scraper finds listings → presents results for review
4. Admin reviews, edits, and publishes selected jobs

**Audit:** Test the existing scraper pipeline end-to-end with a real company. Fix any issues found. Show scrape history per company (already modeled in `JobScrapeLog`).

**Files:** `src/components/admin/job-scraper-panel.tsx`, `src/app/api/admin/companies/[id]/scrape-jobs/route.ts`, `src/lib/job-scraper/`

### B3: Claims History (Not Just Pending)

**Current state:** Claims queue only fetches `PENDING` claims. No way to see approved/rejected history.

**Design:**
- Add a **status filter** at the top of claims queue: `Pending` | `Approved` | `Rejected` | `All`
- Default view remains `Pending` (preserves current behavior)
- Historical claims show additional fields: reviewer name, review note, reviewed date
- Update API `GET /api/admin/claims` to accept a `?status=` query parameter (default: `PENDING`)

**Files:** `src/components/admin/claims-queue.tsx`, `src/app/api/admin/claims/route.ts`

### B4: Partner Logo — Auto-fetch + Upload Fallback

**Current state:** Partner model has a `logo` field (String). Form takes a URL string. No file upload, no auto-fetch.

**Design — Hybrid approach:**
1. Admin enters partner website URL
2. System attempts to auto-fetch the logo from the website (favicon, og:image, or meta tags)
3. If auto-fetch succeeds: preview shown, admin confirms
4. If auto-fetch fails: show message and offer manual file upload
5. Manual uploads saved to `/public/uploads/partners/`

**API:** New `POST /api/admin/partners/upload-logo` endpoint for file uploads.

**Files:** `src/components/admin/partners-manager.tsx`, `src/app/api/admin/partners/route.ts`, new upload endpoint

### B5: Admin Feature Audit

**Approach:** Systematically test each admin tab and verify backend connectivity:

- **Overview stats** — verify numbers come from real database queries
- **Companies** — CRUD, enrich, scrape (covered in B1+B2)
- **Content editor** — verify it reads/writes `ContentBlock` records
- **Newsletter composer** — verify it sends emails (or clearly mark as "coming soon")
- **Analytics** — verify real data or mark placeholder charts
- **Candidates table** — covered in C4

Any placeholders found get either wired up to real backends or clearly marked as "Coming Soon" in the UI.

**Files:** All admin components, corresponding API routes

---

## Group A — Company Rep Profiles & Context Switching

### A1: Schema Changes — Extend User Model

Add new optional fields to the `User` model:

```prisma
model User {
  // ... existing fields ...

  // New profile fields
  avatarUrl       String?
  bio             String?   // Max 500 characters
  publicTitle     String?   // e.g. "CEO", "CTO", "HR Manager"
  linkedinUrl     String?   // Personal LinkedIn URL
  website         String?   // Personal website
  isProfilePublic Boolean   @default(false)
}
```

No new tables needed. Every user gets these fields. The `CompanyClaim` already stores `fullName`, `jobTitle`, `workEmail` — these establish the company connection. The new User fields are the personal profile.

### A2: Rep Profile Page — `/people/[id]`

**Route:** `/[locale]/(main)/people/[id]/page.tsx`

**Layout:**
- **Header:** Avatar, name, public title, bio
- **Links:** LinkedIn, website, email (if opted in)
- **Company connection:** Card showing company logo, name, their role at the company (from `CompanyClaim.jobTitle`). Links back to company page. Shows "Verified Representative" badge.
- **Activity:** Jobs they've posted for the company (with dates)

**Visibility:** Only fully visible when `isProfilePublic` is `true`. Otherwise shows a minimal card with name and company connection only.

**Files:** New page route, new component `src/components/people/profile-page.tsx`

### A3: Team Section on Company Page

Add a "Team" section/tab to the company profile page.

**Data source:** All users with an `APPROVED` `CompanyClaim` for this company.

**Display per team member:**
- Avatar thumbnail (from `User.avatarUrl`)
- Full name (from `CompanyClaim.fullName`)
- Job title (from `CompanyClaim.jobTitle`)
- Click → navigates to `/people/[id]`

For MVP with single rep, this shows just one person. Schema already supports multiple approved claims per company for future expansion.

**Files:** `src/app/[locale]/(main)/companies/[slug]/page.tsx`, new `TeamSection` component

### A4: Context Switcher (LinkedIn-style)

**Modify `UserMenu` component** to support dual-context switching for `COMPANY_REP` users.

**When user has NO approved claim:** Current behavior unchanged — avatar dropdown shows Dashboard, Settings, Sign Out.

**When user has an APPROVED claim (COMPANY_REP):**

Dropdown shows two identity sections:

```
┌──────────────────────────────────┐
│  [Avatar]  Your Name             │
│  Personal Profile      [ACTIVE]  │
│  ────────────────────────────────│
│  [CompanyLogo]  Company Name     │
│  Company Dashboard               │
│  ────────────────────────────────│
│  My Profile · Settings · Sign Out│
└──────────────────────────────────┘
```

- Active identity has accent border/highlight
- Inactive identity is dimmed (opacity)
- Click to switch context

**What changes on switch:**
- **Avatar** in navbar: personal photo ↔ company logo
- **Dashboard** at `/dashboard`: renders candidate dashboard or company dashboard based on active context
- **Navigation links** (Discover, Jobs, Events): remain the same — these don't change

**Implementation:**
- Store `activeContext: "personal" | "company"` in a cookie (not DB) — lightweight, no API call needed
- Clicking a context in the dropdown updates the cookie and refreshes the page
- Default context for `COMPANY_REP`: `"company"` (most common use case)
- The session helper `getCompanyForUser()` already resolves the user's approved company

**Files:** `src/components/layout/user-menu.tsx`, `src/app/[locale]/(main)/dashboard/page.tsx`

### A5: Personal Profile Editor

**Route:** `/dashboard/profile`

**Accessible from:** "My Profile" link in the UserMenu dropdown (available in both contexts).

**Fields:**
- Name, avatar URL, bio, public title, LinkedIn URL, website
- Toggle: profile visibility (public/private)
- Preview link: see your public profile as others would see it

**Completely independent** from the company profile editor. The company dashboard "Profile" tab edits company info. This edits personal info.

**Files:** New page `src/app/[locale]/(main)/dashboard/profile/page.tsx`, new component `src/components/dashboard/profile-editor.tsx`

### Flow Summary

**Gaining company context:**
1. User registers as `CANDIDATE`
2. Claims a company (via claim modal)
3. Admin approves the claim
4. User role → `COMPANY_REP`
5. Context switcher appears in UserMenu
6. User can now switch between personal and company contexts

**Rep changes (future):**
1. Admin revokes the claim
2. User role → `CANDIDATE`
3. Context switcher disappears
4. Personal profile remains intact
5. User can still use platform as a candidate or claim another company

---

## Group D — Landing Page Polish

### D1: "Trusted by" Company Logo Ticker

Add an animated horizontal marquee section below the hero stats, above "How It Works."

**Design:**
- **Label:** "Trusted by" — subtle, centered above the ticker
- **Ticker:** Infinite horizontal scroll of company logos, CSS animation only (no JS)
- **Two rows:** Scrolling in opposite directions for visual depth
- **Logos:** Pulled from `Company.logo` where logo is not null. Grayscale by default, full color on hover
- **Speed:** Slow, smooth — ~30s for full loop
- **Fallback:** If fewer than ~8 companies have logos, hide the section entirely

**Data:** Server component fetches company logos at render time.

**Files:** New component `src/components/landing/trusted-by-ticker.tsx`, modify `src/app/[locale]/(main)/page.tsx`

### D2: Hero Copywriting Update

**Change subtitle** from:
> "Find the companies shaping Greek tech. Follow them, get alerts, discover roles."

**To:**
> "Discover the companies building Greece's tech future. Follow, get alerts, and find your next role."

Update in both `en.json` and `el.json` (Greek translation to match).

**Files:** `src/messages/en.json`, `src/messages/el.json`

### D3: Brand Name Update — "People in Tech"

**Change** the navbar logo from `Hiring.` to `People in Tech` with the accent dot.

**Display:** `People in Tech` with the period rendered in the primary accent color, matching the current `Hiring.` treatment.

**Update everywhere** the brand name appears: navbar, mobile nav, footer, page titles, meta tags.

**Cookie name for context switcher (A4):** `pit-active-context`

**Files:** `src/components/layout/navbar.tsx`, `src/app/layout.tsx` (meta), and any other components referencing the brand name

---

## Execution Order

| Sprint | Group | Scope | Dependencies |
|--------|-------|-------|-------------|
| 1 | C — Quick Fixes | Small | None |
| 2 | B — Admin Improvements | Medium | None |
| 3 | A — Rep Profiles & Switching | Large | B (admin needs to approve claims to test) |
| 4 | D — Landing Page Polish | Small-Medium | None |

## Out of Scope

- Multiple reps per company (schema supports it, UI doesn't — future work)
- Light mode
- Real-time notifications
- File upload to cloud storage (using local `/public/uploads/` for MVP)
- Headless browser testing tool (planned for post-implementation)
