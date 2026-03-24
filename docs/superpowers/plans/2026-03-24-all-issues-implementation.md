# All Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 16 open GitHub issues across landing page, onboarding, navigation, profiles, company dashboard, and admin — then manually test via tunnel before submitting PRs.

**Architecture:** 7 independent task groups executed in parallel via worktree agents. Each group produces one branch with `Closes #N` commits. After all groups complete, merge to a test branch, start dev server + tunnel, manual QA, then push individual branches as PRs.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Prisma (SQLite), NextAuth (JWT), next-intl, Base UI

**Spec:** GitHub issues #1–#16 at https://github.com/Venture-Friends/people_in_tech/issues

---

## File Structure

### Group A: Landing Page (#5, #6, #7)
- Modify: `src/app/[locale]/(main)/page.tsx` — remove FeaturedCompanies import/render
- Modify: `src/components/landing/trusted-by-ticker.tsx` — larger logos
- Modify: `src/components/landing/partners-section.tsx` — fewer items, bigger cards
- Modify: `src/components/landing/hero-section.tsx` — reduce section gap
- Modify: `src/messages/en.json` — hero subtitle
- Modify: `src/messages/el.json` — hero subtitle (Greek)

### Group B: Navigation & Auth (#2, #16)
- Modify: `src/components/layout/navbar.tsx` — Button render prop for Link
- Modify: `src/components/layout/user-menu.tsx` — router.push for menu items, signOut fix
- Modify: `src/components/landing/hero-section.tsx` — Button render prop
- Modify: `src/components/landing/for-companies-cta.tsx` — Button render prop
- Modify: `src/components/auth/forgot-password-form.tsx` — Button render prop
- Modify: `src/components/auth/reset-password-form.tsx` — Button render prop
- Modify: `src/components/auth/verify-claim-status.tsx` — Button render prop
- Modify: `src/components/auth/verify-email-status.tsx` — Button render prop
- Modify: `src/components/dashboard/candidate/profile-settings.tsx` — signOut fix

### Group C: Context Switcher (#4)
- Modify: `src/components/layout/user-menu.tsx` — direct cookie set, hasExplicitPersonalProfile
- Modify: `src/app/api/dashboard/company/profile/route.ts` — add profile check
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx` — allow COMPANY_REP in personal context

### Group D: Onboarding (#1, #8, #15)
- Modify: `src/app/[locale]/(main)/onboarding/page.tsx` — static shell
- Modify: `src/components/onboarding/onboarding-wizard.tsx` — full rewrite: client-side auth, sessionStorage persistence, stable rendering
- Modify: `src/components/onboarding/step-about.tsx` — rename headline → Professional Title, remove IC/Management split, flatten experience levels
- Modify: `src/components/onboarding/step-interests.tsx` — dynamic options
- Modify: `src/lib/constants/onboarding.ts` — flatten EXPERIENCE_LEVELS, update options
- Modify: `src/lib/validations/onboarding.ts` — update schema
- Modify: `src/messages/en.json` — update onboarding keys
- Modify: `src/messages/el.json` — update onboarding keys
- Create: `src/app/api/onboarding/status/route.ts` — lightweight status check

### Group E: Profile Page (#9)
- Modify: `src/components/dashboard/profile-editor.tsx` — avatar upload, skill/interest pickers, view profile link
- Create: `src/app/api/profile/upload-avatar/route.ts` — file upload endpoint
- Modify: `src/app/[locale]/(main)/dashboard/profile/page.tsx` — pass admin flag

### Group F: Company Dashboard (#10, #11, #12)
- Modify: `src/components/dashboard/company/dashboard-client.tsx` — remove gallery tab
- Modify: `src/components/dashboard/company/profile-editor.tsx` — file upload for logo/cover, dimension guidelines, job description field, event linking
- Create: `src/app/api/dashboard/company/upload/route.ts` — company image upload endpoint

### Group G: Admin (#3, #13, #14)
- Create: `src/lib/job-scraper/parsers/smartrecruiters.ts` — SmartRecruiters parser
- Modify: `src/lib/job-scraper/parsers/index.ts` — register SmartRecruiters
- Modify: `src/app/api/admin/jobs/route.ts` — add POST for manual job creation
- Modify: `src/components/admin/jobs-table.tsx` — Add Job dialog
- Modify: `src/components/admin/candidates-table.tsx` — View Profile link

---

## Task 1: Landing Page Polish (#5, #6, #7)

**Branch:** `fix/landing-page-polish`

**Files:**
- Modify: `src/app/[locale]/(main)/page.tsx`
- Modify: `src/components/landing/partners-section.tsx`
- Modify: `src/components/landing/trusted-by-ticker.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/el.json`

- [ ] **Step 1: Remove Featured Companies section from homepage**

In `src/app/[locale]/(main)/page.tsx`:
- Remove the `FeaturedCompanies` import
- Remove the `getFeaturedCompanies()` function call and its data
- Remove `<FeaturedCompanies ... />` from the JSX (around line 210)

- [ ] **Step 2: Enlarge Trusted By ticker logos**

In `src/components/landing/trusted-by-ticker.tsx`:
- Change logo container from current size to `h-16 w-auto` (was likely `h-8` or similar)
- Increase gap between logos
- Reduce the minimum logo count requirement if needed (currently 8, reduce to 4)

- [ ] **Step 3: Redesign Partners section — fewer, bigger cards**

In `src/components/landing/partners-section.tsx`:
- Change grid from `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Increase logo container from `h-20 w-20` to `h-28 w-28`
- Increase logo image from `h-14 w-14` to `h-20 w-20`
- Change name text from `text-xs` to `text-sm font-medium` and ensure single line with `truncate`
- Increase card padding and gap

- [ ] **Step 4: Reduce gap between landing sections**

In `src/app/[locale]/(main)/page.tsx` or individual section components:
- Reduce section spacing gaps where needed (the gap between hero ticker and Trusted By was flagged)

- [ ] **Step 5: Improve hero subtitle copy**

In `src/messages/en.json`, change key `landing.heroSubtitle` from:
"Discover the companies building Greece's tech future. Follow, get alerts, and find your next role."
to:
"Discover the companies shaping Greece's tech scene. Follow your favorites, get notified about new roles, and find your next opportunity."

In `src/messages/el.json`, update the Greek equivalent.

- [ ] **Step 6: Commit**

```
git add -A && git commit -m "fix: polish landing page — remove Featured Companies, bigger partners/logos, improve hero copy

- Remove Featured Companies section (redundant with Trusted By)
- Enlarge Trusted By ticker logos to match old Featured Companies size
- Partners section: 3-column grid with bigger cards and logos
- Improve hero subtitle copywriting for clarity
- Reduce inter-section gaps

Closes #5
Closes #6
Closes #7"
```

---

## Task 2: Navigation & Auth (#2, #16)

**Branch:** `fix/nav-and-auth`

**Files:**
- Modify: `src/components/layout/navbar.tsx`
- Modify: `src/components/layout/user-menu.tsx`
- Modify: `src/components/landing/hero-section.tsx`
- Modify: `src/components/landing/for-companies-cta.tsx`
- Modify: `src/components/auth/forgot-password-form.tsx`
- Modify: `src/components/auth/reset-password-form.tsx`
- Modify: `src/components/auth/verify-claim-status.tsx`
- Modify: `src/components/auth/verify-email-status.tsx`
- Modify: `src/components/dashboard/candidate/profile-settings.tsx`

- [ ] **Step 1: Fix all Button+Link patterns in navbar**

The `<Link href="..."><Button>` pattern doesn't work with Base UI — clicks don't reach the router. Fix by using `<Button render={<Link href="..." />}>` pattern.

In `src/components/layout/navbar.tsx`, replace ALL instances of `<Link href="..."><Button ...>` with `<Button ... render={<Link href="..." />}>`. This applies to:
- Sign In button (desktop + mobile)
- Get Started button (desktop + mobile)

- [ ] **Step 2: Fix Button+Link in hero and CTA sections**

Apply same `render={<Link href />}` fix to:
- `src/components/landing/hero-section.tsx` — "Explore Companies" and "I'm a Company" buttons
- `src/components/landing/for-companies-cta.tsx` — "Claim Page" button

- [ ] **Step 3: Fix Button+Link in auth forms**

Apply same fix to:
- `src/components/auth/forgot-password-form.tsx` — "Back to Sign In" button
- `src/components/auth/reset-password-form.tsx` — "Request New Link" and "Sign In" buttons
- `src/components/auth/verify-claim-status.tsx` — "Set Your Password", "Sign In", "Continue Exploring" buttons
- `src/components/auth/verify-email-status.tsx` — "Start Exploring" and "Back to Sign In" buttons

- [ ] **Step 4: Fix user menu links**

In `src/components/layout/user-menu.tsx`:
- Remove `Link` import from `@/i18n/navigation`
- Change `<Link href="/dashboard/profile"><DropdownMenuItem>` to `<DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>`
- Same for Dashboard link

- [ ] **Step 5: Fix signOut to redirect to login and clear cookies**

In `src/components/layout/user-menu.tsx`, change:
```typescript
onClick={() => signOut({ callbackUrl: "/" }))
```
to:
```typescript
onClick={async () => {
  document.cookie = "pit-active-context=; path=/; max-age=0";
  document.cookie = "next-auth.session-token=; path=/; max-age=0";
  document.cookie = "__Secure-next-auth.session-token=; path=/; max-age=0";
  await signOut({ callbackUrl: "/en/login" });
}}
```

Do the same in `src/components/dashboard/candidate/profile-settings.tsx`.

- [ ] **Step 6: Commit**

```
git add -A && git commit -m "fix: repair nav buttons, fix signOut auto-login issue

- Use Button render={<Link>} pattern for all Button+Link combos (Base UI compat)
- User menu items use router.push instead of nested Link
- SignOut clears all session cookies and redirects to /login

Closes #2
Closes #16"
```

---

## Task 3: Context Switcher (#4)

**Branch:** `fix/context-switcher`

**Files:**
- Modify: `src/components/layout/user-menu.tsx`
- Modify: `src/app/api/dashboard/company/profile/route.ts`
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`

- [ ] **Step 1: Speed up context switching with direct cookie**

In `src/components/layout/user-menu.tsx`, replace the `switchContext` function that does `await fetch("/api/context", ...)` with direct cookie setting:

```typescript
const switchContext = useCallback(
  (context: ActiveContext) => {
    if (context === activeContext) return;
    document.cookie = `pit-active-context=${context}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setActiveContext(context);
    const locale = window.location.pathname.split("/")[1] || "en";
    window.location.href = `/${locale}/dashboard`;
  },
  [activeContext]
);
```

- [ ] **Step 2: Add hasExplicitPersonalProfile to company profile API**

In `src/app/api/dashboard/company/profile/route.ts`:
- Fetch candidateProfile alongside company data using `Promise.all`
- Add `hasExplicitPersonalProfile` boolean to response (true if user has a headline or non-empty skills)
- Update CompanyInfo interface in user-menu to include this field

- [ ] **Step 3: Allow COMPANY_REP in personal context on candidate dashboard**

In `src/app/[locale]/(main)/dashboard/candidate/page.tsx`:
- Import `getActiveContext`
- Allow both CANDIDATE and COMPANY_REP roles
- If COMPANY_REP and context is not "personal", redirect to company dashboard

- [ ] **Step 4: Commit**

```
git add -A && git commit -m "fix: speed up context switcher, hide auto-created profiles

Closes #4"
```

---

## Task 4: Onboarding Redesign (#1, #8, #15)

**Branch:** `fix/onboarding-redesign`

**Files:**
- Modify: `src/app/[locale]/(main)/onboarding/page.tsx`
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Modify: `src/components/onboarding/step-about.tsx`
- Modify: `src/lib/constants/onboarding.ts`
- Modify: `src/lib/validations/onboarding.ts`
- Modify: `src/messages/en.json`
- Modify: `src/messages/el.json`
- Create: `src/app/api/onboarding/status/route.ts`

- [ ] **Step 1: Convert onboarding page to static shell**

Replace `src/app/[locale]/(main)/onboarding/page.tsx` with a minimal server component that does NOT call getServerSession or prisma — just renders `<OnboardingWizard />`. All auth/profile checks move to the client component via API.

- [ ] **Step 2: Create onboarding status API endpoint**

Create `src/app/api/onboarding/status/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ onboardingComplete: false });
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });
  return NextResponse.json({
    onboardingComplete: profile?.onboardingComplete ?? false,
  });
}
```

- [ ] **Step 3: Rewrite OnboardingWizard with full stability**

Rewrite `src/components/onboarding/onboarding-wizard.tsx`:
- Use `useState<number | null>(null)` for step (null = loading)
- Read step + draft from sessionStorage in `useEffect` only (never during SSR)
- Use `form.reset()` to apply draft after hydration
- Use `watch()` subscription (not return value) for auto-save to avoid re-render loops
- Render all 3 steps simultaneously with `display: none/block` (no `key={currentStep}`)
- Client-side auth guard: redirect to /login if unauthenticated
- Client-side profile guard: call `/api/onboarding/status`, redirect to /discover if complete
- Clear sessionStorage on successful submit

- [ ] **Step 4: Flatten experience levels, remove IC/Management split**

In `src/lib/constants/onboarding.ts`:
- Replace `EXPERIENCE_LEVELS: { ic: [...], management: [...] }` with flat array:
```typescript
export const EXPERIENCE_LEVELS = [
  { value: "STUDENT", labelKey: "levelStudent", years: "0" },
  { value: "JUNIOR", labelKey: "levelJunior", years: "0–2" },
  { value: "MID", labelKey: "levelMid", years: "3–5" },
  { value: "SENIOR", labelKey: "levelSenior", years: "5–8" },
  { value: "LEAD", labelKey: "levelLead", years: "8+" },
  { value: "MANAGER", labelKey: "levelManager", years: "5+" },
  { value: "DIRECTOR", labelKey: "levelDirector", years: "10+" },
] as const;
```
Remove FRESH_GRADUATE, STAFF, EXECUTIVE (simplify).

- [ ] **Step 5: Rename "headline" to "Professional Title"**

In `src/messages/en.json`, change `onboarding.headline` to `onboarding.professionalTitle` with value "Professional Title".
Change placeholder from current to "e.g. Senior Frontend Engineer | React & TypeScript".

In `src/components/onboarding/step-about.tsx`:
- Update label from `t("headline")` to `t("professionalTitle")`
- Render experience levels as a flat single grid (no IC/Management divider)

- [ ] **Step 6: Update validation schema**

In `src/lib/validations/onboarding.ts`:
- Remove FRESH_GRADUATE, STAFF, EXECUTIVE from the experienceLevel enum
- Keep the rest unchanged

- [ ] **Step 7: Commit**

```
git add -A && git commit -m "fix: redesign onboarding — stable step 3, rename fields, flatten experience levels

- Convert server page to static shell to prevent revalidation remounts
- Client-side auth + profile status checks via API
- SessionStorage persistence for step + form data
- All steps rendered simultaneously (display:none/block)
- Rename 'headline' to 'Professional Title'
- Flatten experience levels, remove IC/Management split
- Simplify from 10 to 7 experience levels

Closes #1
Closes #8
Closes #15"
```

---

## Task 5: Profile Page Improvements (#9)

**Branch:** `fix/profile-improvements`

**Files:**
- Modify: `src/components/dashboard/profile-editor.tsx`
- Create: `src/app/api/profile/upload-avatar/route.ts`

- [ ] **Step 1: Create avatar upload API endpoint**

Create `src/app/api/profile/upload-avatar/route.ts`:
- Accept POST with FormData containing an image file
- Validate file type (PNG, JPG, GIF, WebP) and size (max 2MB)
- Save to `/public/uploads/avatars/{userId}-{timestamp}.{ext}`
- Return the URL path
- Follow the same pattern as `src/app/api/admin/partners/upload-logo/route.ts`

- [ ] **Step 2: Add avatar upload to profile editor**

In `src/components/dashboard/profile-editor.tsx`:
- Make the avatar area clickable (wrap in a label with hidden file input)
- On file selection, upload to `/api/profile/upload-avatar`, get back URL
- Set the URL as avatarUrl in the form
- Show upload progress indicator

- [ ] **Step 3: Add "View My Profile" link**

In `src/components/dashboard/profile-editor.tsx`:
- Add a "View Public Profile" button/link that opens `/profile/{userId}` in a new tab
- Only show if `isProfilePublic` is true
- For admin profiles, show a note that admin profiles are internal only

- [ ] **Step 4: Commit**

```
git add -A && git commit -m "feat: profile page — avatar upload, view profile link

- Click avatar to upload a photo (PNG/JPG/GIF/WebP, max 2MB)
- 'View Public Profile' link when profile is public
- Admin profiles show internal-only note

Closes #9"
```

---

## Task 6: Company Dashboard Cleanup (#10, #11, #12)

**Branch:** `fix/company-dashboard`

**Files:**
- Modify: `src/components/dashboard/company/dashboard-client.tsx`
- Modify: `src/components/dashboard/company/profile-editor.tsx`
- Create: `src/app/api/dashboard/company/upload/route.ts`

- [ ] **Step 1: Remove gallery tab from company dashboard**

In `src/components/dashboard/company/dashboard-client.tsx`:
- Remove the Gallery tab from the sidebar navigation
- Remove the gallery-manager import and rendering
- Keep the file but remove the gallery tab entry

- [ ] **Step 2: Replace placeholders with "Coming Soon" messaging**

In `src/components/dashboard/company/dashboard-client.tsx`:
- For any placeholder/non-functional sections (analytics, etc.), show a clean "Coming Soon" card with description and icon instead of broken placeholder content

- [ ] **Step 3: Create company image upload endpoint**

Create `src/app/api/dashboard/company/upload/route.ts`:
- Accept POST with FormData (image file + field name: "logo" or "cover")
- Validate file type and size (logo: max 2MB, cover: max 5MB)
- Save to `/public/uploads/companies/{companyId}-{field}-{timestamp}.{ext}`
- Return URL path

- [ ] **Step 4: Add file upload for logo and cover image**

In `src/components/dashboard/company/profile-editor.tsx`:
- Add a file upload button next to the Logo URL input (or replace it)
- Add a file upload button for Cover Image
- Show dimension guidelines: "Logo: 200×200px, PNG/SVG/JPG" and "Cover: 1200×400px, JPG/PNG"
- Show accepted formats and max file size
- Preview the uploaded image

- [ ] **Step 5: Commit**

```
git add -A && git commit -m "fix: company dashboard — remove gallery, file uploads, coming soon states

- Remove gallery section entirely
- Replace placeholders with clean Coming Soon messaging
- Add file upload for logo and cover image with dimension guidelines
- Show accepted formats and size limits

Closes #10
Closes #11
Closes #12"
```

---

## Task 7: Admin Improvements (#3, #13, #14)

**Branch:** `fix/admin-improvements`

**Files:**
- Create: `src/lib/job-scraper/parsers/smartrecruiters.ts`
- Modify: `src/lib/job-scraper/parsers/index.ts`
- Modify: `src/app/api/admin/jobs/route.ts`
- Modify: `src/components/admin/jobs-table.tsx`
- Modify: `src/components/admin/candidates-table.tsx`

- [ ] **Step 1: Add SmartRecruiters job scraper parser**

Create `src/lib/job-scraper/parsers/smartrecruiters.ts`:
- Use SmartRecruiters public API: `https://careers.smartrecruiters.com/{companyId}/api/more?offset=0&limit=100`
- Extract company ID from URL patterns: `careers.smartrecruiters.com/Company` or custom domains like `careers.deliveryhero.com`
- Fallback to alternate API: `https://api.smartrecruiters.com/v1/companies/{companyId}/postings`
- Map response to ScrapedJob format

- [ ] **Step 2: Register SmartRecruiters in parser index**

In `src/lib/job-scraper/parsers/index.ts`:
- Import `parseSmartRecruiters`
- Add two ATS_DETECTORS entries:
  1. Pattern: `/(?:jobs|careers)\.smartrecruiters\.com/i`
  2. Pattern: `/careers\.[^.]+\.com\/(?:jobs|search|postings)/i` for custom career domains

- [ ] **Step 3: Add manual job creation API**

In `src/app/api/admin/jobs/route.ts`:
- Add POST handler that accepts `{ title, companyId, description, location, type, externalUrl }`
- Validate required fields (title, companyId)
- Create job via prisma with status "ACTIVE"

- [ ] **Step 4: Add "Add Job" dialog to jobs table**

In `src/components/admin/jobs-table.tsx`:
- Add "Add Job" button in the header
- Dialog with: company selector dropdown, title, description textarea, location, type select, external URL
- Fetch companies list from `/api/admin/companies` for the selector
- On submit, POST to `/api/admin/jobs`, refresh table

- [ ] **Step 5: Add "View Profile" link to candidates table**

In `src/components/admin/candidates-table.tsx`:
- Add a "View" action button in each row
- Links to `/profile/{userId}` to see the public profile
- If no public profile exists, show tooltip "Profile not public"

- [ ] **Step 6: Commit**

```
git add -A && git commit -m "fix: admin — SmartRecruiters scraper, manual job add, profile links

- Add SmartRecruiters parser for sites like careers.deliveryhero.com
- Manual job creation via Add Job dialog in admin
- View Profile links in candidates table

Closes #3
Closes #13
Closes #14"
```

---

## Post-Implementation: Testing & PRs

After all 7 tasks complete:

1. Merge all branches into `test/all-fixes-combined` from main
2. Start dev server + cloudflared tunnel
3. Manual QA checklist:
   - [ ] Landing: no Featured Companies, bigger Trusted By logos, bigger partner cards, improved hero text
   - [ ] Nav: Get Started → /register, Sign In → /login
   - [ ] Sign Out → clean login page, no auto-login
   - [ ] Onboarding: all 3 steps stable, Professional Title field, flat experience levels
   - [ ] Context switcher: fast switching, no blank state
   - [ ] Profile: avatar upload, view profile link
   - [ ] Company dashboard: no gallery, Coming Soon sections, logo/cover upload
   - [ ] Admin: Add Job works, job scraping with SmartRecruiters, View Profile on candidates
4. For each passing group, push branch and create PR with `Closes #N`
5. Any failures get new issues for the next cycle
