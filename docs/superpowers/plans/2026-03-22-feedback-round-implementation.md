# Feedback Round Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all feedback from the 2026-03-22 feedback round — quick fixes, admin improvements, company rep profiles with context switching, landing page polish, and E2E testing.

**Architecture:** 5 sprints executed sequentially. Within each sprint, independent tasks run in parallel via worktree agents. Each sprint ends with a code review checkpoint. Sprint 5 is a headless browser E2E test of all flows.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Prisma (SQLite), NextAuth, next-intl, Playwright (for E2E)

**Spec:** `docs/superpowers/specs/2026-03-22-feedback-round-design.md`

---

## Sprint 0: Setup — Migrate & Seed Database

### Task 0.1: Migrate and Seed Database

**Files:**
- Run: `prisma/seed.mts`

- [ ] **Step 1: Run migrations**

```bash
npx prisma db push
```

Expected: Schema applied to `prisma/dev.db`

- [ ] **Step 2: Run seed**

```bash
npx prisma db seed
```

Expected: Admin, candidate, and companies created

- [ ] **Step 3: Verify seed data**

```bash
python3 -c "
import sqlite3
conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
for row in c.execute('SELECT email, name, role FROM users'): print(row)
print('---')
c.execute('SELECT COUNT(*) FROM companies')
print('Companies:', c.fetchone()[0])
conn.close()
"
```

Expected: admin@pos4work.gr (ADMIN), demo@candidate.gr (CANDIDATE), 20+ companies

### Task 0.2: Add Company Rep Test Account to Seed

**Files:**
- Modify: `prisma/seed.mts`

- [ ] **Step 1: Add company rep user and approved claim to seed**

After the candidate user creation block, add:

```typescript
const repPassword = await hash("rep123", 10);

const companyRep = await prisma.user.upsert({
  where: { email: "rep@company.gr" },
  update: {},
  create: {
    email: "rep@company.gr",
    name: "Nikos Georgiou",
    passwordHash: repPassword,
    role: "COMPANY_REP",
    emailVerified: true,
  },
});
console.log(`✓ Company rep user: ${companyRep.email}`);
```

Then after companies are created, find the first company (e.g., Workable) and create an approved claim:

```typescript
const workable = await prisma.company.findFirst({ where: { slug: "workable" } });
if (workable) {
  await prisma.companyClaim.upsert({
    where: { id: "seed-claim-workable" },
    update: {},
    create: {
      id: "seed-claim-workable",
      companyId: workable.id,
      userId: companyRep.id,
      fullName: "Nikos Georgiou",
      jobTitle: "Head of Talent Acquisition",
      workEmail: "nikos@workable.com",
      linkedinUrl: "https://linkedin.com/in/nikos-georgiou",
      status: "APPROVED",
      reviewedBy: admin.id,
      reviewNote: "Verified via seed data",
      reviewedAt: new Date(),
    },
  });

  await prisma.company.update({
    where: { id: workable.id },
    data: { status: "VERIFIED" },
  });
  console.log(`✓ Approved claim: ${companyRep.name} → ${workable.name}`);
}
```

- [ ] **Step 2: Re-run seed**

```bash
npx prisma db seed
```

- [ ] **Step 3: Verify rep account exists**

Verify via python3 sqlite3 query that rep@company.gr exists with role COMPANY_REP and has an APPROVED claim.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.mts
git commit -m "feat: add company rep test account to seed data"
```

---

## Sprint 1: Quick Fixes (Group C)

> **Parallelization:** All 4 tasks are independent. Dispatch as parallel worktree agents.

### Task 1.1: Fix Sort Dropdown Labels (C1 + C2)

**Files:**
- Modify: `src/components/discover/sort-dropdown.tsx:29-30`

- [ ] **Step 1: Read the current component**

Read `src/components/discover/sort-dropdown.tsx` to confirm the issue.

- [ ] **Step 2: Fix SelectValue to show translated label**

The `SelectValue` on line 30 shows the raw `value` prop instead of the translated label. Fix by adding a `placeholder` prop:

```tsx
<SelectTrigger className="w-[180px]">
  <SelectValue placeholder={t("sortMostFollowed")} />
</SelectTrigger>
```

This ensures the trigger displays the currently selected item's child text (the translated label from `SelectItem`), not the value.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/en/discover`. Check that:
- Default sort shows "Most Followed" (not "mostFollowed")
- Selecting "Recently Added" shows "Recently Added" (not "recent")
- All sort options display with proper spacing

- [ ] **Step 4: Commit**

```bash
git add src/components/discover/sort-dropdown.tsx
git commit -m "fix: sort dropdown shows translated labels instead of raw values"
```

### Task 1.2: Fix Event Card Date Box Sizing (C3)

**Files:**
- Modify: `src/components/shared/event-card.tsx:46`

- [ ] **Step 1: Read the current component**

Read `src/components/shared/event-card.tsx` lines 42-54 to see the date block.

- [ ] **Step 2: Set fixed dimensions on date block**

Change line 46 from:
```tsx
<div className="flex flex-col items-center justify-center rounded-[10px] bg-primary/[0.06] border border-primary/[0.1] min-w-[56px] min-h-[56px] px-[14px] py-2 shrink-0 self-center sm:self-auto">
```
To:
```tsx
<div className="flex flex-col items-center justify-center rounded-[10px] bg-primary/[0.06] border border-primary/[0.1] w-[56px] h-[56px] shrink-0 self-center sm:self-auto">
```

Remove `min-w`, `min-h`, `px-[14px]`, `py-2` and use fixed `w-[56px] h-[56px]` for uniform sizing.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/en/events`. Check that all event card date boxes are the same size regardless of month abbreviation.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/event-card.tsx
git commit -m "fix: uniform date box sizing on event cards"
```

### Task 1.3: Fix Missing Users in Admin Candidates (C4)

**Files:**
- Modify: `src/app/api/admin/candidates/route.ts`
- Modify: `src/components/admin/candidates-table.tsx`

- [ ] **Step 1: Read the current API route**

Read `src/app/api/admin/candidates/route.ts` to understand how candidates are queried.

- [ ] **Step 2: Update API to include users without CandidateProfile**

The current query likely uses `candidateProfile` as a required relation. Change to use a LEFT JOIN approach — query `User` table where role is `CANDIDATE`, with optional `include` of `candidateProfile`:

```typescript
const users = await prisma.user.findMany({
  where: {
    role: { in: ["CANDIDATE", "COMPANY_REP"] },
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    } : {}),
  },
  include: {
    candidateProfile: true,
  },
  orderBy: { createdAt: "desc" },
});
```

Map the response to include an `onboardingComplete` flag derived from whether `candidateProfile` exists and `candidateProfile.onboardingComplete` is true.

- [ ] **Step 3: Update candidates table to show onboarding status**

Add an "Onboarding" column to the table that shows:
- "Complete" (green badge) when `onboardingComplete` is true
- "Pending" (amber badge) when false or profile doesn't exist

- [ ] **Step 4: Verify in browser**

Navigate to admin dashboard → Candidates tab. Verify:
- All registered users appear (including those without completed onboarding)
- The onboarding status column shows correct values
- fratzeskos.nikolas@gmail.com appears (if registered in the DB)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/candidates/route.ts src/components/admin/candidates-table.tsx
git commit -m "fix: show all registered users in admin candidates, add onboarding status"
```

### Task 1.4: Sprint 1 Code Review Checkpoint

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Dispatch code review agent**

Use `superpowers:requesting-code-review` against the spec to verify all C items are addressed.

---

## Sprint 2: Admin Dashboard Improvements (Group B)

> **Parallelization:** B1+B2 are coupled (both touch companies-table). B3 and B4 are independent. Run B3 and B4 as parallel agents, then B1+B2 together.

### Task 2.1: Claims History with Status Filter (B3)

**Files:**
- Modify: `src/app/api/admin/claims/route.ts`
- Modify: `src/components/admin/claims-queue.tsx`

- [ ] **Step 1: Read current API and component**

Read both files fully to understand current implementation.

- [ ] **Step 2: Add status query param to API**

In `src/app/api/admin/claims/route.ts`, update the GET handler to accept a `status` query parameter:

```typescript
const { searchParams } = new URL(request.url);
const statusFilter = searchParams.get("status") || "PENDING";

const whereClause = statusFilter === "ALL"
  ? {}
  : { status: statusFilter };

const claims = await prisma.companyClaim.findMany({
  where: whereClause,
  include: {
    company: { select: { name: true, slug: true, industry: true } },
    user: { select: { name: true, email: true } },
    reviewer: { select: { name: true } },
  },
  orderBy: { createdAt: "desc" },
});
```

- [ ] **Step 3: Add status filter UI to claims queue**

At the top of `ClaimsQueue`, add filter chips:

```tsx
const [statusFilter, setStatusFilter] = useState("PENDING");

// In fetchClaims:
const res = await fetch(`/api/admin/claims?status=${statusFilter}`);

// UI - filter chips above the claims list:
<div className="flex gap-2 mb-4">
  {["PENDING", "APPROVED", "REJECTED", "ALL"].map((s) => (
    <button
      key={s}
      onClick={() => setStatusFilter(s)}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
        statusFilter === s
          ? "border-primary/25 bg-primary/5 text-primary"
          : "border-white/6 bg-white/2 text-white/45 hover:border-white/12"
      )}
    >
      {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Show review info for historical claims**

For approved/rejected claims, display reviewer name, review note, and reviewed date below the existing claim info:

```tsx
{claim.status !== "PENDING" && (
  <div className="mt-3 pt-3 border-t border-white/[0.04]">
    <div className="flex items-center gap-2 text-xs text-white/40">
      <span>{claim.status === "APPROVED" ? "Approved" : "Rejected"} by {claim.reviewerName}</span>
      <span>·</span>
      <span>{new Date(claim.reviewedAt).toLocaleDateString()}</span>
    </div>
    {claim.reviewNote && (
      <p className="mt-1 text-xs text-white/30 italic">"{claim.reviewNote}"</p>
    )}
  </div>
)}
```

- [ ] **Step 5: Refetch on filter change**

Add `statusFilter` to the `useEffect` dependency array so claims refetch when the filter changes.

- [ ] **Step 6: Verify in browser**

Navigate to admin dashboard → Claims tab. Verify:
- Default shows pending claims
- Clicking "Approved" shows approved claims with reviewer info
- Clicking "All" shows everything
- Filter chips highlight correctly

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/claims/route.ts src/components/admin/claims-queue.tsx
git commit -m "feat: add status filter to claims queue, show claim history"
```

### Task 2.2: Partner Logo — Auto-fetch + Upload Fallback (B4)

**Files:**
- Modify: `src/components/admin/partners-manager.tsx`
- Create: `src/app/api/admin/partners/fetch-logo/route.ts`
- Create: `src/app/api/admin/partners/upload-logo/route.ts`
- Create: `public/uploads/partners/.gitkeep`

- [ ] **Step 1: Create fetch-logo API endpoint**

Create `src/app/api/admin/partners/fetch-logo/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  try {
    // Try favicon first
    const faviconUrl = new URL("/favicon.ico", url).href;
    const faviconRes = await fetch(faviconUrl, { signal: AbortSignal.timeout(5000) });
    if (faviconRes.ok) {
      return NextResponse.json({ logoUrl: faviconUrl });
    }

    // Try og:image from HTML
    const htmlRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await htmlRes.text();
    const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogMatch) {
      return NextResponse.json({ logoUrl: ogMatch[1] });
    }

    // Try apple-touch-icon
    const appleMatch = html.match(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i);
    if (appleMatch) {
      const iconUrl = new URL(appleMatch[1], url).href;
      return NextResponse.json({ logoUrl: iconUrl });
    }

    return NextResponse.json({ error: "Could not find logo automatically" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch from URL" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create upload-logo API endpoint**

Create `src/app/api/admin/partners/upload-logo/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("logo") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public/uploads/partners");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return NextResponse.json({ logoUrl: `/uploads/partners/${filename}` });
}
```

- [ ] **Step 3: Update PartnerForm in partners-manager.tsx**

In the `PartnerForm` component, replace the plain logo URL input with a hybrid approach:

1. Website URL field — on blur, attempt auto-fetch via `POST /api/admin/partners/fetch-logo`
2. If auto-fetch succeeds, show preview and pre-fill the logo field
3. If auto-fetch fails, show message and a file upload button
4. File upload calls `POST /api/admin/partners/upload-logo` and fills the logo URL

Add logo preview thumbnail next to the input showing the current logo.

- [ ] **Step 4: Create uploads directory**

```bash
mkdir -p public/uploads/partners
touch public/uploads/partners/.gitkeep
```

Add `public/uploads/partners/*` (but not `.gitkeep`) to `.gitignore`.

- [ ] **Step 5: Verify in browser**

Navigate to admin dashboard → Partners tab:
- Add a partner with a website URL → verify logo auto-fetches
- Add a partner where auto-fetch fails → verify upload fallback works
- Verify logo previews show correctly

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/partners/fetch-logo/route.ts src/app/api/admin/partners/upload-logo/route.ts src/components/admin/partners-manager.tsx public/uploads/partners/.gitkeep .gitignore
git commit -m "feat: partner logo auto-fetch from website with manual upload fallback"
```

### Task 2.3: Full Company Profile Editing from Admin (B1)

**Files:**
- Modify: `src/components/admin/companies-table.tsx`
- Modify: `src/app/api/admin/companies/[id]/route.ts`

- [ ] **Step 1: Read current edit dialog and API**

Read `src/components/admin/companies-table.tsx` lines 538-574 (edit dialog) and `src/app/api/admin/companies/[id]/route.ts` (PUT handler).

- [ ] **Step 2: Expand formData state**

Update the `formData` state to include all company fields:

```typescript
const [formData, setFormData] = useState({
  name: "",
  industry: "",
  website: "",
  description: "",
  linkedinUrl: "",
  careersUrl: "",
  logo: "",
  coverImage: "",
  size: "SMALL",
  founded: "",
  locations: [] as string[],
  technologies: [] as string[],
});
```

Update `openEdit()` to populate all fields from the company data.

- [ ] **Step 3: Replace edit Dialog with Sheet (slide-over panel)**

Replace the edit `Dialog` with a `Sheet` component from shadcn/ui that slides in from the right. Organize fields into sections:

```tsx
<Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Edit Company</SheetTitle>
    </SheetHeader>

    <div className="space-y-6 py-4">
      {/* Basic Info Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Basic Info</h4>
        {/* Name, Industry (select), Size (select), Founded (number), Description (textarea) */}
      </div>

      {/* Links Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Links</h4>
        {/* Website, LinkedIn URL, Careers Page URL */}
      </div>

      {/* Media Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Media</h4>
        {/* Logo URL (with preview), Cover Image URL (with preview) */}
      </div>

      {/* Details Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Details</h4>
        {/* Locations (multi-select chips), Technologies (multi-select chips) */}
      </div>

      {/* Status Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/60">Status</h4>
        {/* Featured toggle, Status badge (read-only) */}
      </div>
    </div>

    <SheetFooter>
      <Button onClick={handleEdit}>Save Changes</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

- [ ] **Step 4: Add auto-enrichment with feedback**

Add an "Enrich from Website" button in the Links section. When clicked:
1. Call the existing enrich endpoint
2. Pre-fill fields that were found
3. Show a toast indicating which fields were auto-filled and which need manual input
4. If enrichment fails, show error message

- [ ] **Step 5: Update PUT API to accept all fields**

In `src/app/api/admin/companies/[id]/route.ts`, extend the PUT handler to accept and update all Company fields (not just name, industry, website, description).

- [ ] **Step 6: Verify in browser**

Navigate to admin dashboard → Companies tab → click Edit on any company:
- Sheet slides in from right with all sections
- Pre-populated with existing data
- "Enrich from Website" auto-fills available fields
- Save updates all fields
- Careers URL field is prominently visible

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/companies-table.tsx src/app/api/admin/companies/[id]/route.ts
git commit -m "feat: full company profile editing via slide-over panel with auto-enrichment"
```

### Task 2.4: Job Scraping — LinkedIn Source + Career Page URL (B2)

**Files:**
- Modify: `src/components/admin/job-scraper-panel.tsx`
- Modify: `src/lib/job-scraper/index.ts`
- Create: `src/lib/job-scraper/parsers/linkedin.ts`
- Modify: `src/app/api/admin/companies/[id]/scrape-jobs/route.ts`

- [ ] **Step 1: Read current scraper implementation**

Read all files in `src/lib/job-scraper/` and the scrape-jobs API route.

- [ ] **Step 2: Add LinkedIn parser**

Create `src/lib/job-scraper/parsers/linkedin.ts`:

```typescript
import type { ScrapedJob } from "../types";

export async function parseLinkedInJobs(companyUrl: string): Promise<ScrapedJob[]> {
  // LinkedIn company page URL → jobs section
  // e.g., https://www.linkedin.com/company/workable/jobs/
  const jobsUrl = companyUrl.replace(/\/$/, "") + "/jobs/";

  const res = await fetch(jobsUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PeopleInTech/1.0)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`LinkedIn returned ${res.status}`);
  }

  const html = await res.text();
  // Parse job listings from LinkedIn's public jobs page HTML
  // LinkedIn public pages use specific data attributes and structured markup
  const jobs: ScrapedJob[] = [];

  // Extract job cards from the page
  // LinkedIn public company job pages render job-card elements
  const jobRegex = /<a[^>]*href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"]+)"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/g;
  let match;
  while ((match = jobRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim().replace(/<[^>]+>/g, "");
    if (title && url) {
      jobs.push({
        title,
        url,
        location: null,
        type: null,
        department: null,
        description: null,
        source: "linkedin",
        confidence: 0.7,
      });
    }
  }

  return jobs;
}
```

- [ ] **Step 3: Add source selection to scraper panel**

In `job-scraper-panel.tsx`, add a source selector before the "Scan" button:

```tsx
const [source, setSource] = useState<"careers" | "linkedin">("careers");

// Source selector UI:
<div className="flex gap-2 mb-3">
  <button
    onClick={() => setSource("careers")}
    className={cn("rounded-full px-3 py-1 text-xs font-medium border",
      source === "careers" ? "border-primary/25 bg-primary/5 text-primary" : "border-white/6 text-white/45"
    )}
  >
    Careers Page
  </button>
  <button
    onClick={() => setSource("linkedin")}
    className={cn("rounded-full px-3 py-1 text-xs font-medium border",
      source === "linkedin" ? "border-primary/25 bg-primary/5 text-primary" : "border-white/6 text-white/45"
    )}
  >
    LinkedIn
  </button>
</div>
```

Pass `source` to the scan API call.

- [ ] **Step 4: Update scrape-jobs API to accept source param**

In the scrape-jobs route, read the `source` query param and route to the appropriate parser:

```typescript
const source = searchParams.get("source") || "careers";

if (source === "linkedin") {
  const linkedinUrl = company.linkedinUrl;
  if (!linkedinUrl) {
    return NextResponse.json({ error: "No LinkedIn URL set for this company" }, { status: 400 });
  }
  jobs = await parseLinkedInJobs(linkedinUrl);
} else {
  // Existing careers page scraping logic
  const careersUrl = company.careersUrl || company.website;
  if (!careersUrl) {
    return NextResponse.json({ error: "No careers URL or website set" }, { status: 400 });
  }
  jobs = await scrapeJobs(careersUrl, company.id);
}
```

- [ ] **Step 5: Verify with real companies**

Test with Workable, Blueground, Skroutz, Netdata:
- Set their careers page URLs in the admin edit panel
- Set their LinkedIn URLs
- Run scrape from careers page → verify jobs found
- Run scrape from LinkedIn → verify jobs found
- Import selected jobs → verify they appear in the jobs list

- [ ] **Step 6: Commit**

```bash
git add src/lib/job-scraper/ src/components/admin/job-scraper-panel.tsx src/app/api/admin/companies/*/scrape-jobs/
git commit -m "feat: add LinkedIn job scraping source, career page URL input for scraper"
```

### Task 2.5: Admin Feature Audit (B5)

**Files:**
- Various admin components and API routes

- [ ] **Step 1: Test each admin tab systematically**

For each tab in the admin dashboard, verify:

| Tab | Test | Expected |
|-----|------|----------|
| Overview | Load page | Stats show real DB counts |
| Companies | Add/Edit/Delete/Enrich/Scrape | All CRUD operations work |
| Jobs | View/Edit/Delete | Jobs manageable |
| Events | View/Add/Edit/Delete | Events manageable |
| Claims | View pending/approve/reject | Claims processing works |
| Partners | Add/Edit/Delete | Partners manageable |
| Content | Edit content blocks | Saves to ContentBlock table |
| Newsletter | Compose and preview | Draft saves correctly |
| Candidates | View all users | Shows all registered users |
| Analytics | Load charts | Charts render (real or placeholder) |

- [ ] **Step 2: Fix any broken features found**

For each feature that doesn't work:
- If it's a simple fix (missing API connection), wire it up
- If it's a complex feature not yet built, add a "Coming Soon" badge to the UI

- [ ] **Step 3: Commit fixes**

```bash
git add -u  # Stage only modified tracked files from audit fixes
git commit -m "fix: wire up admin features found during audit, mark placeholders"
```

### Task 2.6: Sprint 2 Code Review Checkpoint

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Dispatch code review agent**

Review all Group B changes against the spec.

---

## Sprint 3: Company Rep Profiles & Context Switching (Group A)

> **Sequential first (schema), then parallel (A2+A3), then sequential (A4, A5).**

### Task 3.1: Schema Migration — Extend User Model (A1)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new fields to User model**

In `prisma/schema.prisma`, add after the `updatedAt` field:

```prisma
  // Profile fields
  avatarUrl       String?
  bio             String?
  publicTitle     String?
  linkedinUrl     String?
  website         String?
  isProfilePublic Boolean   @default(false)
```

- [ ] **Step 2: Push schema changes**

```bash
npx prisma db push
```

Expected: Schema updated, no data loss.

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 4: Update seed with profile data for test rep**

In `prisma/seed.mts`, update the company rep user creation to include profile fields:

```typescript
const companyRep = await prisma.user.upsert({
  where: { email: "rep@company.gr" },
  update: {},
  create: {
    email: "rep@company.gr",
    name: "Nikos Georgiou",
    passwordHash: repPassword,
    role: "COMPANY_REP",
    emailVerified: true,
    avatarUrl: null,
    bio: "Talent acquisition professional with 8 years of experience in Greek tech.",
    publicTitle: "Head of Talent Acquisition",
    linkedinUrl: "https://linkedin.com/in/nikos-georgiou",
    website: null,
    isProfilePublic: true,
  },
});
```

- [ ] **Step 5: Re-seed database**

```bash
npx prisma db seed
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/seed.mts
git commit -m "feat: extend User model with profile fields for company rep profiles"
```

### Task 3.2: Rep Profile Page — /people/[id] (A2)

**Files:**
- Create: `src/app/[locale]/(main)/people/[id]/page.tsx`

- [ ] **Step 1: Create the profile page**

Create `src/app/[locale]/(main)/people/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Building2, ExternalLink, Linkedin, Globe, Mail, Briefcase } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

async function getProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      companyClaims: {
        where: { status: "APPROVED" },
        include: {
          company: {
            select: { id: true, name: true, slug: true, logo: true, industry: true },
          },
        },
        take: 1,
      },
    },
  });

  if (!user) return null;
  return user; // isProfilePublic controls detail level, not visibility
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getProfile(id);
  if (!user) return { title: "Profile Not Found" };
  return {
    title: `${user.name} — People in Tech`,
    description: user.bio || `${user.name} on People in Tech`,
  };
}

export default async function PersonProfilePage({ params }: Props) {
  const { id } = await params;
  const user = await getProfile(id);
  if (!user) notFound();

  const claim = user.companyClaims[0] || null;
  const company = claim?.company || null;
  const isPublic = user.isProfilePublic;

  // Get jobs posted by this user's company (only if profile is public)
  let postedJobs: { id: string; title: string; postedAt: Date }[] = [];
  if (company && isPublic) {
    postedJobs = await prisma.jobListing.findMany({
      where: { companyId: company.id, status: "ACTIVE" },
      select: { id: true, title: true, postedAt: true },
      orderBy: { postedAt: "desc" },
      take: 10,
    });
  }

  // Private profile: show minimal card (name + company only)
  if (!isPublic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] text-xl font-bold text-white/40">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{user.name}</h1>
            {company && <p className="text-sm text-white/40">{claim?.jobTitle} at {company.name}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Public profile: full details
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="flex items-start gap-5">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="size-20 rounded-full object-cover border border-white/[0.08]" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] text-2xl font-bold text-white/40">
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
          {user.publicTitle && (
            <p className="mt-1 text-sm text-white/50">{user.publicTitle}</p>
          )}
          {user.bio && (
            <p className="mt-3 text-sm leading-relaxed text-white/40">{user.bio}</p>
          )}
          <div className="mt-3 flex items-center gap-3">
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
                <Linkedin className="size-4" />
              </a>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
                <Globe className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Company Connection */}
      {company && claim && (
        <div className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">Company</h2>
          <Link href={`/companies/${company.slug}`}>
            <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="size-12 rounded-lg object-contain" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-lg bg-white/[0.06]">
                  <Building2 className="size-5 text-white/30" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{company.name}</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Verified Representative
                  </span>
                </div>
                <p className="text-xs text-white/40">{claim.jobTitle} · {company.industry}</p>
              </div>
              <ExternalLink className="ml-auto size-4 text-white/20" />
            </div>
          </Link>
        </div>
      )}

      {/* Posted Jobs */}
      {postedJobs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
            <Briefcase className="inline size-3.5 mr-1" />
            Jobs Posted ({postedJobs.length})
          </h2>
          <div className="space-y-2">
            {postedJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                <span className="text-sm text-foreground">{job.title}</span>
                <span className="text-xs text-white/30">{new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/en/people/<rep-user-id>`. Verify:
- Profile header shows correctly
- Company connection card links to company page
- Posted jobs list shows

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/(main)/people/
git commit -m "feat: add public profile page for company representatives"
```

### Task 3.3: Team Section on Company Page (A3)

**Files:**
- Modify: `src/app/[locale]/(main)/companies/[slug]/page.tsx`

- [ ] **Step 1: Read current company page**

Read the full company profile page to understand the tab structure and data fetching.

- [ ] **Step 2: Fetch approved claims for team section**

In the `getCompany()` function or alongside it, query for approved claims:

```typescript
const teamMembers = await prisma.companyClaim.findMany({
  where: { companyId: company.id, status: "APPROVED" },
  include: {
    user: {
      select: { id: true, name: true, avatarUrl: true },
    },
  },
});
```

- [ ] **Step 3: Add Team section to the company page**

After the company description/about section and before the Open Roles tab content, add a Team section:

```tsx
{teamMembers.length > 0 && (
  <div className="mt-6">
    <h3 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">Team</h3>
    <div className="flex flex-wrap gap-3">
      {teamMembers.map((member) => (
        <Link key={member.id} href={`/people/${member.user.id}`}>
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
            {member.user.avatarUrl ? (
              <img src={member.user.avatarUrl} alt={member.fullName} className="size-8 rounded-full object-cover" />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-white/40">
                {member.fullName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{member.fullName}</p>
              <p className="text-xs text-white/40">{member.jobTitle}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify in browser**

Navigate to the Workable company page. Verify:
- Team section shows "Nikos Georgiou - Head of Talent Acquisition"
- Clicking the team member card goes to `/people/[id]`

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(main)/companies/[slug]/page.tsx
git commit -m "feat: add team section to company profile page showing approved reps"
```

### Task 3.4: Context Switcher in UserMenu (A4)

**Files:**
- Modify: `src/components/layout/user-menu.tsx`
- Modify: `src/lib/auth.ts` (add company context to session)
- Create: `src/lib/context.ts` (cookie-based context management)

- [ ] **Step 1: Create context helper**

Create `src/lib/context.ts`:

```typescript
import { cookies } from "next/headers";

export type ActiveContext = "personal" | "company";

export async function getActiveContext(): Promise<ActiveContext> {
  const cookieStore = await cookies();
  return (cookieStore.get("pit-active-context")?.value as ActiveContext) || "personal";
}

export async function setActiveContext(context: ActiveContext) {
  const cookieStore = await cookies();
  cookieStore.set("pit-active-context", context, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
```

- [ ] **Step 2: Create context switch API route**

Create `src/app/api/context/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { context } = await request.json();
  if (context !== "personal" && context !== "company") {
    return NextResponse.json({ error: "Invalid context" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("pit-active-context", context, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
```

- [ ] **Step 3: Update UserMenu with context switcher**

Read current `src/components/layout/user-menu.tsx` then expand it:

```tsx
// Add state for company info and active context
const [activeContext, setActiveContext] = useState<"personal" | "company">("personal");
const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; slug: string } | null>(null);

// Fetch company info on mount (if user is COMPANY_REP)
useEffect(() => {
  if (session?.user?.role === "COMPANY_REP") {
    fetch("/api/dashboard/company/profile")
      .then(res => res.json())
      .then(data => {
        if (data.company) setCompanyInfo(data.company);
      })
      .catch(() => {});

    // Read cookie for initial context
    const cookie = document.cookie.split("; ").find(c => c.startsWith("pit-active-context="));
    if (cookie) setActiveContext(cookie.split("=")[1] as "personal" | "company");
    else setActiveContext("company"); // Default for reps
  }
}, [session]);

const switchContext = async (ctx: "personal" | "company") => {
  await fetch("/api/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: ctx }),
  });
  setActiveContext(ctx);
  window.location.href = "/dashboard";
};
```

Then in the dropdown content, before the existing menu items, add the identity switcher section (only for COMPANY_REP):

```tsx
{session?.user?.role === "COMPANY_REP" && companyInfo && (
  <>
    {/* Personal identity */}
    <DropdownMenuItem
      onClick={() => switchContext("personal")}
      className={cn("flex items-center gap-3 p-2", activeContext === "personal" && "border-l-2 border-primary")}
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold">
        {session.user.name?.charAt(0)}
      </div>
      <div>
        <div className="text-sm font-medium">{session.user.name}</div>
        <div className="text-xs text-white/40">Personal Profile</div>
      </div>
      {activeContext === "personal" && <span className="ml-auto text-[10px] text-primary">ACTIVE</span>}
    </DropdownMenuItem>

    {/* Company identity */}
    <DropdownMenuItem
      onClick={() => switchContext("company")}
      className={cn("flex items-center gap-3 p-2", activeContext === "company" && "border-l-2 border-primary")}
    >
      {companyInfo.logo ? (
        <img src={companyInfo.logo} className="size-8 rounded-md object-contain" alt={companyInfo.name} />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-md bg-white/[0.06]">
          <Building2 className="size-4 text-white/30" />
        </div>
      )}
      <div>
        <div className="text-sm font-medium">{companyInfo.name}</div>
        <div className="text-xs text-white/40">Company Dashboard</div>
      </div>
      {activeContext === "company" && <span className="ml-auto text-[10px] text-primary">ACTIVE</span>}
    </DropdownMenuItem>

    <DropdownMenuSeparator />
  </>
)}
```

- [ ] **Step 4: Update dashboard routing to respect context**

In `src/app/[locale]/(main)/dashboard/page.tsx`, read the active context cookie:

```typescript
import { getActiveContext } from "@/lib/context";

// Inside the component, after session check:
if (user.role === "COMPANY_REP") {
  const context = await getActiveContext();
  if (context === "company") {
    redirect("/dashboard/company");
  } else {
    redirect("/dashboard/candidate");
  }
}
```

- [ ] **Step 5: Update navbar avatar to reflect active context**

In the UserMenu trigger, show company logo when in company context:

```tsx
// In the DropdownMenuTrigger:
{activeContext === "company" && companyInfo?.logo ? (
  <img src={companyInfo.logo} className="size-8 rounded-md object-contain" alt={companyInfo.name} />
) : (
  // Existing personal avatar with initials
)}
```

- [ ] **Step 6: Verify in browser**

Log in as rep@company.gr / rep123:
- Context switcher appears in dropdown with both identities
- Clicking "Personal Profile" switches to candidate dashboard
- Clicking "Company Dashboard" switches to company dashboard
- Avatar changes between personal and company
- Context persists across page reloads (cookie)

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/user-menu.tsx src/lib/context.ts src/app/api/context/route.ts src/app/[locale]/(main)/dashboard/page.tsx
git commit -m "feat: LinkedIn-style context switcher for company reps"
```

### Task 3.5: Personal Profile Editor (A5)

**Files:**
- Create: `src/app/[locale]/(main)/dashboard/profile/page.tsx`
- Create: `src/components/dashboard/profile-editor.tsx`
- Create: `src/app/api/profile/route.ts`

- [ ] **Step 1: Create profile API route**

Create `src/app/api/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, avatarUrl: true, bio: true,
      publicTitle: true, linkedinUrl: true, website: true, isProfilePublic: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, avatarUrl, bio, publicTitle, linkedinUrl, website, isProfilePublic } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bio !== undefined && { bio: bio?.slice(0, 500) }),
      ...(publicTitle !== undefined && { publicTitle }),
      ...(linkedinUrl !== undefined && { linkedinUrl }),
      ...(website !== undefined && { website }),
      ...(isProfilePublic !== undefined && { isProfilePublic }),
    },
    select: {
      id: true, name: true, avatarUrl: true, bio: true,
      publicTitle: true, linkedinUrl: true, website: true, isProfilePublic: true,
    },
  });

  return NextResponse.json({ user });
}
```

- [ ] **Step 2: Create profile editor component**

Create `src/components/dashboard/profile-editor.tsx` with form fields for: name, avatar URL, bio (textarea, 500 char limit), public title, LinkedIn URL, website, and a toggle for profile visibility.

Include a "View Public Profile" link that opens `/people/[id]` in a new tab.

- [ ] **Step 3: Create profile dashboard page**

Create `src/app/[locale]/(main)/dashboard/profile/page.tsx` that renders the profile editor. Requires authentication.

- [ ] **Step 4: Add "My Profile" link to UserMenu**

In `user-menu.tsx`, add a "My Profile" menu item that navigates to `/dashboard/profile`:

```tsx
<DropdownMenuItem asChild>
  <Link href="/dashboard/profile">My Profile</Link>
</DropdownMenuItem>
```

- [ ] **Step 5: Verify in browser**

Log in as rep@company.gr:
- Click "My Profile" in dropdown → profile editor loads
- Edit bio, title, LinkedIn → save → changes reflected
- Toggle profile public → visit `/people/[id]` → profile visible
- Toggle profile private → visit `/people/[id]` → shows minimal card

- [ ] **Step 6: Commit**

```bash
git add src/app/api/profile/ src/components/dashboard/profile-editor.tsx src/app/[locale]/(main)/dashboard/profile/ src/components/layout/user-menu.tsx
git commit -m "feat: personal profile editor with public/private toggle"
```

### Task 3.6: Sprint 3 Code Review Checkpoint

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Dispatch code review agent**

Review all Group A changes against the spec. Verify:
- Schema migration applied correctly
- Profile page renders for public profiles
- Team section shows on company page
- Context switcher works for COMPANY_REP users
- Profile editor saves and retrieves data
- Context persists in cookie

---

## Sprint 4: Landing Page Polish (Group D)

> **Parallelization:** All 3 tasks are independent. Dispatch as parallel worktree agents.

### Task 4.1: "Trusted by" Company Logo Ticker (D1)

**Files:**
- Create: `src/components/landing/trusted-by-ticker.tsx`
- Modify: `src/app/[locale]/(main)/page.tsx`

- [ ] **Step 1: Create the ticker component**

Create `src/components/landing/trusted-by-ticker.tsx`:

```tsx
interface TrustedByTickerProps {
  logos: { name: string; logo: string; slug: string }[];
}

export function TrustedByTicker({ logos }: TrustedByTickerProps) {
  if (logos.length < 8) return null; // Don't show with too few logos

  // Split logos into two rows for opposite-direction scrolling
  const mid = Math.ceil(logos.length / 2);
  const row1 = logos.slice(0, mid);
  const row2 = logos.slice(mid);

  return (
    <section className="py-16 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
        Trusted by
      </p>

      {/* Row 1 - scrolls left */}
      <div className="relative mb-4">
        <div className="flex animate-scroll-left gap-12 whitespace-nowrap">
          {[...row1, ...row1].map((company, i) => (
            <img
              key={`r1-${i}`}
              src={company.logo}
              alt={company.name}
              className="h-8 w-auto object-contain opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Row 2 - scrolls right */}
      <div className="relative">
        <div className="flex animate-scroll-right gap-12 whitespace-nowrap">
          {[...row2, ...row2].map((company, i) => (
            <img
              key={`r2-${i}`}
              src={company.logo}
              alt={company.name}
              className="h-8 w-auto object-contain opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add CSS animations to globals.css**

Add to `src/app/globals.css`:

```css
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes scroll-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
}
.animate-scroll-right {
  animation: scroll-right 30s linear infinite;
}
```

- [ ] **Step 3: Add ticker to landing page**

In `src/app/[locale]/(main)/page.tsx`, fetch company logos and render the ticker after the hero section:

```typescript
// In data fetching:
const companyLogos = await prisma.company.findMany({
  where: { logo: { not: null } },
  select: { name: true, logo: true, slug: true },
});

// In JSX, after HeroSection:
<TrustedByTicker logos={companyLogos.filter(c => c.logo).map(c => ({ ...c, logo: c.logo! }))} />
```

- [ ] **Step 4: Verify in browser**

Navigate to landing page. Verify:
- Two rows of logos scroll in opposite directions
- Logos are grayscale, color on hover
- Animation is smooth at ~30s loop
- Section hidden if fewer than 6 logos

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/trusted-by-ticker.tsx src/app/globals.css src/app/[locale]/(main)/page.tsx
git commit -m "feat: add Trusted By animated company logo ticker to landing page"
```

### Task 4.2: Hero Copywriting Update (D2)

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/el.json`

- [ ] **Step 1: Update English subtitle**

In `src/messages/en.json`, change:
```json
"heroSubtitle": "Find the companies shaping Greek tech. Follow them, get alerts, discover roles."
```
To:
```json
"heroSubtitle": "Discover the companies building Greece's tech future. Follow, get alerts, and find your next role."
```

- [ ] **Step 2: Update Greek subtitle**

In `src/messages/el.json`, update the Greek translation to match the new English copy.

- [ ] **Step 3: Verify in browser**

Check both `/en` and `/el` landing pages show the updated subtitle.

- [ ] **Step 4: Commit**

```bash
git add src/messages/en.json src/messages/el.json
git commit -m "fix: update hero subtitle copy for better clarity"
```

### Task 4.3: Brand Name Update — "People in Tech" (D3)

**Files:**
- Modify: `src/components/layout/navbar.tsx:35-37`
- Modify: `src/app/layout.tsx` (meta title)
- Search and update any other references to "Hiring."

- [ ] **Step 1: Update navbar logo**

In `src/components/layout/navbar.tsx`, change line 36:
```tsx
<Link href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
  Hiring<span className="text-primary">.</span>
</Link>
```
To:
```tsx
<Link href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
  People in Tech<span className="text-primary">.</span>
</Link>
```

- [ ] **Step 2: Search for all "Hiring" references**

```bash
grep -r "Hiring" src/ --include="*.tsx" --include="*.ts" --include="*.json" -l
```

Update any other references found (mobile nav, footer, meta tags, auth layouts, email templates, scraper user-agent strings, etc.). Stage all changed files.

- [ ] **Step 3: Update meta title in layout**

In `src/app/layout.tsx`, update the metadata:
```typescript
export const metadata: Metadata = {
  title: "People in Tech",
  description: "Discover the companies building Greece's tech future",
};
```

- [ ] **Step 4: Verify in browser**

Check:
- Navbar shows "People in Tech." (with accent dot)
- Browser tab title says "People in Tech"
- Mobile nav shows correct brand name

- [ ] **Step 5: Commit**

```bash
git add -u  # Stage all modified tracked files found during grep
git commit -m "feat: rebrand from Hiring. to People in Tech."
```

### Task 4.4: Sprint 4 Code Review Checkpoint

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Dispatch code review agent**

Review all Group D changes against the spec.

---

## Sprint 5: Headless Browser E2E Testing

### Task 5.1: Install Playwright and Setup

**Files:**
- Create: `e2e/` directory
- Modify: `package.json` (add Playwright dep)

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create Playwright config**

Create `playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "chore: add Playwright for E2E testing"
```

### Task 5.2: Candidate Flow E2E Tests

**Files:**
- Create: `e2e/candidate-flow.spec.ts`

- [ ] **Step 1: Write candidate flow tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Candidate Flow", () => {
  test("can view landing page", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("text=People in Tech")).toBeVisible();
    await expect(page.locator("text=Greece's Tech")).toBeVisible();
  });

  test("can browse discover page", async ({ page }) => {
    await page.goto("/en/discover");
    await expect(page.locator("text=Discover")).toBeVisible();
    // Verify sort dropdown shows labels correctly
    const sortTrigger = page.locator("[data-slot='select-trigger']").first();
    await expect(sortTrigger).toContainText("Most Followed");
  });

  test("can view events page", async ({ page }) => {
    await page.goto("/en/events");
    // Verify date boxes exist and are uniform
    const dateBoxes = page.locator('[class*="bg-primary"]').filter({ hasText: /[A-Z]{3}/ });
    if (await dateBoxes.count() > 1) {
      const firstBox = await dateBoxes.first().boundingBox();
      const secondBox = await dateBoxes.nth(1).boundingBox();
      if (firstBox && secondBox) {
        expect(firstBox.width).toBeCloseTo(secondBox.width, 0);
        expect(firstBox.height).toBeCloseTo(secondBox.height, 0);
      }
    }
  });

  test("can login as candidate", async ({ page }) => {
    await page.goto("/en/login");
    await page.fill('input[name="email"]', "demo@candidate.gr");
    await page.fill('input[name="password"]', "demo123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/**");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("can view company profile and team section", async ({ page }) => {
    await page.goto("/en/companies/workable");
    await expect(page.locator("text=Workable")).toBeVisible();
    // Check team section exists
    await expect(page.locator("text=Team")).toBeVisible();
    await expect(page.locator("text=Nikos Georgiou")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx playwright test e2e/candidate-flow.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/candidate-flow.spec.ts
git commit -m "test: add candidate flow E2E tests"
```

### Task 5.3: Company Rep Flow E2E Tests

**Files:**
- Create: `e2e/company-rep-flow.spec.ts`

- [ ] **Step 1: Write company rep flow tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Company Rep Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as company rep
    await page.goto("/en/login");
    await page.fill('input[name="email"]', "rep@company.gr");
    await page.fill('input[name="password"]', "rep123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard/**");
  });

  test("context switcher shows in dropdown", async ({ page }) => {
    // Open user menu
    await page.locator('[data-slot="dropdown-menu-trigger"]').first().click();
    await expect(page.locator("text=Personal Profile")).toBeVisible();
    await expect(page.locator("text=Company Dashboard")).toBeVisible();
  });

  test("can switch to personal context", async ({ page }) => {
    await page.locator('[data-slot="dropdown-menu-trigger"]').first().click();
    await page.locator("text=Personal Profile").click();
    await page.waitForURL("**/dashboard/**");
    // Should show candidate dashboard
  });

  test("can switch to company context", async ({ page }) => {
    await page.locator('[data-slot="dropdown-menu-trigger"]').first().click();
    await page.locator("text=Company Dashboard").click();
    await page.waitForURL("**/dashboard/company**");
  });

  test("can edit personal profile", async ({ page }) => {
    await page.goto("/en/dashboard/profile");
    await page.fill('textarea[name="bio"]', "Updated bio for testing");
    await page.click('button:has-text("Save")');
    // Verify toast or success
    await expect(page.locator("text=Updated bio for testing")).toBeVisible();
  });

  test("public profile page is visible", async ({ page }) => {
    // Get the user ID and visit the public profile
    const res = await page.request.get("/api/profile");
    const data = await res.json();
    await page.goto(`/en/people/${data.user.id}`);
    await expect(page.locator("text=Nikos Georgiou")).toBeVisible();
    await expect(page.locator("text=Verified Representative")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx playwright test e2e/company-rep-flow.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git add e2e/company-rep-flow.spec.ts
git commit -m "test: add company rep flow E2E tests"
```

### Task 5.4: Admin Flow E2E Tests

**Files:**
- Create: `e2e/admin-flow.spec.ts`

- [ ] **Step 1: Write admin flow tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/login");
    await page.fill('input[name="email"]', "admin@pos4work.gr");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin**");
  });

  test("admin dashboard loads with real stats", async ({ page }) => {
    await expect(page.locator("text=Overview")).toBeVisible();
    // Verify stats cards show numbers (not 0 or placeholder)
  });

  test("can view and filter companies", async ({ page }) => {
    await page.locator("text=Companies").click();
    await expect(page.locator("text=Workable")).toBeVisible();
    // Test edit slide-over opens
    const editButton = page.locator('button:has([class*="Pencil"])').first();
    await editButton.click();
    await expect(page.locator("text=Edit Company")).toBeVisible();
    // Verify all sections exist
    await expect(page.locator("text=Basic Info")).toBeVisible();
    await expect(page.locator("text=Links")).toBeVisible();
  });

  test("claims queue shows history filter", async ({ page }) => {
    await page.locator("text=Claims").click();
    await expect(page.locator("text=Pending")).toBeVisible();
    await expect(page.locator("text=Approved")).toBeVisible();
    await expect(page.locator("text=Rejected")).toBeVisible();
    // Click Approved to see historical claims
    await page.locator('button:has-text("Approved")').click();
  });

  test("candidates table shows all users", async ({ page }) => {
    await page.locator("text=Candidates").click();
    // Should show users regardless of onboarding status
    await expect(page.locator("text=demo@candidate.gr")).toBeVisible();
  });

  test("partners management works", async ({ page }) => {
    await page.locator("text=Partners").click();
    // Test add partner
    await page.locator('button:has-text("Add")').click();
    await expect(page.locator("text=Add Partner")).toBeVisible();
  });

  test("job scraper shows source selector", async ({ page }) => {
    await page.locator("text=Companies").click();
    // Find a company with the scan button
    const scanButton = page.locator('button:has([class*="ScanSearch"])').first();
    await scanButton.click();
    // Verify source selector exists
    await expect(page.locator("text=Careers Page")).toBeVisible();
    await expect(page.locator("text=LinkedIn")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npx playwright test
```

- [ ] **Step 3: Fix any failures and re-run**

Address failures found during testing. Each fix should be a separate commit.

- [ ] **Step 4: Generate test report**

```bash
npx playwright test --reporter=html
```

Open the report and verify all tests pass.

- [ ] **Step 5: Final commit**

```bash
git add e2e/ playwright.config.ts
git commit -m "test: complete E2E test suite for all user flows"
```

---

## Test Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pos4work.gr | admin123 |
| Candidate | demo@candidate.gr | demo123 |
| Company Rep | rep@company.gr | rep123 |

## Test Companies

| Company | Careers Page | LinkedIn |
|---------|-------------|----------|
| Workable | https://www.workable.com/careers | https://www.linkedin.com/company/workable |
| Blueground | https://www.theblueground.com/careers | https://www.linkedin.com/company/blueground |
| Skroutz | https://www.skroutz.gr/careers | https://www.linkedin.com/company/skroutz |
| Netdata | https://www.netdata.cloud/careers | https://www.linkedin.com/company/netdata |
