# PR H: Profile Access Control + Express Interest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Express Interest" action on job listings, restrict candidate profile pages to admin + authorized company reps, and show interested candidates in the admin panel.

**Architecture:** New `JobInterest` Prisma model for the interest relationship. New API route to toggle interest. Update JobCard with interest button. Restrict `/profile/[id]` access based on role and interest. Add interested candidates column/view to admin JobsTable.

**Tech Stack:** Next.js 16, React 19, Prisma, Tailwind CSS, Better Auth

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `prisma/schema.prisma` | Add JobInterest model + relations |
| Create | `src/app/api/jobs/[id]/interest/route.ts` | Toggle interest API |
| Modify | `src/components/jobs/job-card.tsx` | Add Express Interest button |
| Modify | `src/app/[locale]/(main)/profile/[id]/page.tsx` | Restrict access to admin + company reps |
| Modify | `src/components/admin/jobs-table.tsx` | Show interested candidate count + profiles |

---

### Task 1: Add JobInterest model to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add JobInterest model**

Add after the `SavedJob` model in `prisma/schema.prisma`:

```prisma
model JobInterest {
  id        String   @id @default(cuid())
  userId    String
  jobId     String
  createdAt DateTime @default(now())

  user User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  JobListing @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([userId, jobId])
  @@map("job_interests")
}
```

- [ ] **Step 2: Add relations to User and JobListing**

In the `User` model, add:
```prisma
  jobInterests       JobInterest[]
```

In the `JobListing` model, add:
```prisma
  interests JobInterest[]
```

- [ ] **Step 3: Push schema and generate**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "schema: add JobInterest model for express interest feature"
```

---

### Task 2: Create interest toggle API route

**Files:**
- Create: `src/app/api/jobs/[id]/interest/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/jobs/[id]/interest/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidates can express interest" }, { status: 403 });
  }

  const { id: jobId } = await params;

  const existing = await prisma.jobInterest.findUnique({
    where: {
      userId_jobId: {
        userId: session.user.id,
        jobId,
      },
    },
  });

  if (existing) {
    await prisma.jobInterest.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ interested: false });
  }

  await prisma.jobInterest.create({
    data: {
      userId: session.user.id,
      jobId,
    },
  });

  return NextResponse.json({ interested: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/jobs/[id]/interest/route.ts"
git commit -m "feat: add express interest toggle API route"
```

---

### Task 3: Add Express Interest button to JobCard

**Files:**
- Modify: `src/components/jobs/job-card.tsx`

- [ ] **Step 1: Add interest state and handler**

In `src/components/jobs/job-card.tsx`:

Add `Hand` (or `Heart` or `Sparkles`) to the lucide-react import. Add `isInterested` prop and state:

Update the `JobCardProps` interface:
```typescript
interface JobCardProps {
  job: JobCardData;
  isSaved?: boolean;
  isInterested?: boolean;
}
```

Update the component signature:
```typescript
export function JobCard({ job, isSaved = false, isInterested: initialInterested = false }: JobCardProps) {
```

Add state and handler after the existing `saved`/`saving` state:
```typescript
  const [interested, setInterested] = useState(initialInterested);
  const [toggling, setToggling] = useState(false);

  async function handleInterest(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in to express interest");
      return;
    }
    setToggling(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/interest`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setInterested(data.interested);
      toast.success(data.interested ? "Interest expressed" : "Interest withdrawn");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setToggling(false);
    }
  }
```

- [ ] **Step 2: Add the button to the JSX**

Add the interest button before the save button (around line 132). Import `Hand` from lucide-react:

```typescript
        {/* Express Interest button — candidates only */}
        {session?.user?.role === "CANDIDATE" && (
          <button
            onClick={handleInterest}
            disabled={toggling}
            className="shrink-0 rounded-full p-2 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            aria-label={interested ? "Withdraw interest" : "Express interest"}
          >
            <Hand className={`size-4 ${interested ? "fill-primary text-primary" : ""}`} />
          </button>
        )}
```

Note: The `role` comes from the session. If `session.user.role` is not available on the client, you may need to check `authClient.useSession()` — the session object should include `role` since it's in the User model.

- [ ] **Step 3: Commit**

```bash
git add src/components/jobs/job-card.tsx
git commit -m "feat: add express interest button to job card"
```

---

### Task 4: Restrict profile page access

**Files:**
- Modify: `src/app/[locale]/(main)/profile/[id]/page.tsx`

- [ ] **Step 1: Update the access control logic**

In `src/app/[locale]/(main)/profile/[id]/page.tsx`, find the section after `getUser()` where access is checked. Replace the existing access control with:

```typescript
  // Access control: only ADMIN and COMPANY_REP (with interest) can view
  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/login?returnTo=/profile/${id}`);
  }

  const viewerRole = session.user.role;

  if (viewerRole === "CANDIDATE") {
    // Candidates cannot view other candidates' profiles
    notFound();
  }

  if (viewerRole === "COMPANY_REP") {
    // Company rep can only view if candidate expressed interest in one of their jobs
    const claim = await prisma.companyClaim.findFirst({
      where: {
        userId: session.user.id,
        status: "APPROVED",
      },
      select: { companyId: true },
    });

    if (!claim) {
      notFound();
    }

    const hasInterest = await prisma.jobInterest.findFirst({
      where: {
        userId: id, // the candidate whose profile we're viewing
        job: {
          companyId: claim.companyId,
        },
      },
    });

    if (!hasInterest) {
      notFound();
    }
  }

  // ADMIN can always view — no additional check needed
```

Also update `generateMetadata` to not leak info for unauthorized users — return generic metadata always since the page requires auth.

- [ ] **Step 2: Remove the old `isProfilePublic` public access logic**

The profile page previously allowed public access when `isProfilePublic` was true. Remove that — access is now role-based regardless of the public flag. Keep the `isProfilePublic` check only for the "private profile" display (if the candidate set it to private, even authorized viewers see a notice).

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(main)/profile/[id]/page.tsx"
git commit -m "feat: restrict profile access to admin and authorized company reps"
```

---

### Task 5: Show interested candidates in admin jobs table

**Files:**
- Modify: `src/components/admin/jobs-table.tsx`

- [ ] **Step 1: Read the current jobs-table.tsx**

Read `src/components/admin/jobs-table.tsx` to understand the current table structure, columns, and data fetching.

- [ ] **Step 2: Add interested count to job data fetching**

Update the API route or the component's data fetching to include `_count: { select: { interests: true } }` on each job listing. Add an "Interested" column to the table.

- [ ] **Step 3: Add expandable row or click handler to show interested candidates**

When clicking a job row (or an "Interested" count badge), fetch and display the list of interested candidates:
- Name, headline, experience level
- Link to `/profile/[userId]`
- Timestamp

Use a side panel or expandable row — follow the existing pattern in the admin panel (e.g., how claims or other details are shown).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/jobs-table.tsx
git commit -m "feat: show interested candidates in admin jobs table"
```
