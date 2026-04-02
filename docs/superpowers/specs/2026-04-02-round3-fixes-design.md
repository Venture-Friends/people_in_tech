# Round 3 Fixes and Features — Design Spec

**Date:** 2026-04-02
**Context:** Feedback from manual QA of PRs A-E, plus new feature requirements for candidate interest expression and profile access control.

## Overview

4 PRs addressing feedback on recently merged work plus new features.

---

## PR F: Onboarding Revert to Original 3-Step

### Problem

The current 3-step onboarding (About → Interests → CV Upload) lost the Preferences step and added a CV upload step that doesn't work reliably. The original 3-step flow (About → Interests → Preferences) was better.

### Solution

Revert the onboarding wizard to the original 3-step structure. Update the email preferences from three granular toggles to a single "Allow companies to contact me via email" toggle.

### Changes

1. **Rewrite onboarding wizard** back to 3 steps:
   - Step 1: About (name, headline, LinkedIn, experience level) — existing `step-about.tsx`
   - Step 2: Interests (role interests, skills, industries) — existing `step-interests.tsx`
   - Step 3: Preferences (preferred locations, "allow companies to contact me" toggle, language preference)

2. **Rewrite step-preferences.tsx** — replace the three email toggles (weekly digest, events, newsletter) with a single toggle: "Allow companies to contact me via email"

3. **Update onboarding validation schema** (`src/lib/validations/onboarding.ts`) — replace `emailDigest`, `emailEvents`, `emailNewsletter` with `allowContactEmail: boolean`

4. **Update onboarding API route** (`src/app/api/onboarding/route.ts`) — persist `allowContactEmail` instead of the three email fields

5. **Update Prisma schema** — add `allowContactEmail Boolean @default(true)` to `CandidateProfile`, keep the old email fields for now (no migration needed, just stop writing to them from onboarding)

6. **Delete email verification banner** (`src/components/shared/email-verification-banner.tsx`) — no longer needed

7. **Remove email verification banner import** from dashboard page

8. **STEP_FIELDS mapping** — step 1: fullName/headline/linkedinUrl/experienceLevel, step 2: roleInterests/skills/industries, step 3: preferredLocations/allowContactEmail/language

---

## PR G: Auth Pages Branding

### Problem

Login and register pages use a separate `(auth)` layout with subtle radial gradients, missing the animated background (orbs, particles, grid) that the rest of the site has. Inconsistent with the onboarding flow which does have branding.

### Solution

Move login and register pages from the `(auth)` route group into the `(main)` route group so they inherit the animated background, navbar, and footer. The forms themselves stay centered.

### Changes

1. **Move page files:**
   - `src/app/[locale]/(auth)/login/page.tsx` → `src/app/[locale]/(main)/login/page.tsx`
   - `src/app/[locale]/(auth)/register/page.tsx` → `src/app/[locale]/(main)/register/page.tsx`

2. **Update middleware/proxy** if it references the `(auth)` group for route matching

3. **Delete `(auth)` layout** (`src/app/[locale]/(auth)/layout.tsx`) — no longer needed

4. **Wrap login/register forms in a centered container** — since they'll now be inside the main layout with navbar, add centering wrapper:
   ```
   min-h-[calc(100vh-8rem)] flex items-center justify-center
   ```

5. **Keep the "People in Tech." logo above the form** — extract from the old auth layout and render above the form card, or rely on the navbar branding

6. **Test:** Verify login/register pages show animated background, navbar, and forms are accessible (no z-index issues with background overlapping inputs — this was flagged in feedback #44, #45)

---

## PR H: Profile Access Control + Express Interest

### Problem

Public candidate profiles are currently accessible to anyone with the URL. They should only be visible to admin and company reps (when a candidate has expressed interest in one of their jobs). There's also no mechanism for candidates to express interest in specific roles.

### Solution

Add an "Express Interest" action on job listings. Restrict profile page access. Show interested candidates in the admin panel.

### Data Model

New Prisma model:
```prisma
model JobInterest {
  id        String   @id @default(cuid())
  userId    String
  jobId     String
  createdAt DateTime @default(now())

  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  JobListing  @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
  @@map("job_interests")
}
```

Add relations to `User` and `JobListing` models.

### Profile Access Control

Update `/profile/[id]` page:
- Check session. If no session → redirect to login
- If session user is ADMIN → allow access
- If session user is COMPANY_REP → allow access only if the candidate has expressed interest in one of their company's jobs (query JobInterest joined with JobListing where companyId matches the rep's claimed company)
- If session user is CANDIDATE → deny access (404 or "Profile not available")
- Keep `isProfilePublic` toggle — if candidate sets profile to private, nobody can see it (not even companies they've expressed interest to)

### Express Interest Button

- Appears on job listing cards and the company roles tab
- Only visible to logged-in CANDIDATE users
- Toggle behavior: click to express interest, click again to withdraw
- Visual: subtle button/icon, similar to the existing Follow and Save patterns
- API: `POST /api/jobs/[id]/interest` — toggles interest on/off, returns new state

### Admin View

- In the admin Jobs table, add an "Interested" count column
- Clicking a job row (or expanding it) shows the list of interested candidates with:
  - Name, headline, experience level, skills
  - Link to view their full profile at `/profile/[id]`
  - Timestamp of when they expressed interest

### Candidate Dashboard

- In the candidate's existing dashboard, the "Saved Jobs" tab can optionally show which jobs they've expressed interest in (badge or indicator), but this is not required for MVP

---

## PR I: Profile Editor Fixes

### Problem

Feedback from QA testing:
- #52: Edit/preview toggle should be on the right side
- #53: Option boxes (skills, roles, industries) should match onboarding style (list with add-your-own)
- #54: Remove email notifications section

### Changes

1. **Move edit/preview toggle to right side** — currently centered, move to top-right of the profile editor header area

2. **Match option boxes to onboarding style** — the profile editor's skills/roles/industries sections should use the same `ComboboxMultiSelect` and `SkillPicker` components as onboarding (they may already — verify and align styling)

3. **Replace email notifications section** — remove the three toggles (weekly digest, events, newsletter). Replace with single "Allow companies to contact me via email" toggle matching the new `allowContactEmail` field

4. **Keep Delete Account** — stays at the bottom in a danger zone section

---

## PR Dependency Order

```
PR F (onboarding revert)  — independent, do first (touches schema)
PR G (auth branding)       — independent
PR I (profile editor)      — after PR F (needs allowContactEmail field)
PR H (access control + interest) — after PR F (needs schema push for JobInterest)
```

## What's NOT Changing

- PR C (CV fix) — stays, CV upload still works in profile editor
- PR D (gatekeeping copy) — approved, no changes
- PR E (newsletter removal) — approved, no changes
- Company dashboard — stays as placeholder
- Admin panel — existing structure, just adding interested candidates view
