# Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate from NextAuth v4 + SQLite to Better Auth + Neon Postgres in a single branch.

**Architecture:** Swap database layer first (Prisma provider + connection), then replace auth library (config, client, server helpers), then update all consumers (48 server endpoints, 12 client components), then add middleware protection, then clean up deleted files.

**Tech Stack:** Next.js 16, Better Auth, Prisma 7 with PostgreSQL (Neon), React 19

**Spec:** `docs/superpowers/specs/2026-03-26-auth-migration-design.md`

---

## Task 1: Install dependencies and swap database provider

**Files:**
- Modify: `package.json`
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma.ts`
- Modify: `.env`

- [ ] **Step 1: Install Better Auth, remove NextAuth and SQLite dependencies**

```bash
npm install better-auth
npm uninstall next-auth bcryptjs @types/bcryptjs @prisma/adapter-better-sqlite3 better-sqlite3 @types/better-sqlite3
```

- [ ] **Step 2: Update `.env` with Neon Postgres connection and Better Auth vars**

Replace the existing env vars:

```env
# Database — Neon Postgres
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/people_in_tech?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"

# Client-side app URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Remove: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

The user will fill in their actual Neon connection string and generate a secret.

- [ ] **Step 3: Update Prisma schema — switch provider and remove old auth models**

In `prisma/schema.prisma`:

Change the datasource block:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Remove these two models entirely:
- `EmailVerificationToken` (lines 304-314)
- `PasswordResetToken` (lines 316-327)

Remove the relations from the `User` model:
```prisma
  emailVerificationTokens EmailVerificationToken[]
  passwordResetTokens     PasswordResetToken[]
```

- [ ] **Step 4: Update Prisma client — remove SQLite adapter**

Rewrite `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Generate Better Auth schema additions**

Run:
```bash
npx @better-auth/cli generate
```

This adds Better Auth's required tables (`session`, `account`, `verification`) to your Prisma schema. Review the generated changes — they should add 3 new models.

- [ ] **Step 6: Generate Prisma client and push schema to Neon**

```bash
npx prisma generate
npx prisma db push
```

Expected: Schema pushed to Neon Postgres successfully. No data migration needed.

- [ ] **Step 7: Verify database connection**

```bash
npx prisma studio
```

Expected: Prisma Studio opens and connects to Neon. Tables are empty but visible.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json prisma/schema.prisma src/lib/prisma.ts .env
git commit -m "chore: migrate from SQLite to Neon Postgres, install Better Auth"
```

---

## Task 2: Set up Better Auth server config

**Files:**
- Rewrite: `src/lib/auth.ts`
- Create: `src/lib/auth-session.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Delete: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Rewrite `src/lib/auth.ts`**

Replace entire file with:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Auth] Verify email for ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CANDIDATE",
        input: false,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
```

Note: `requireEmailVerification` and `sendOnSignUp` are set to `false` for now — email verification can be enabled once Resend is integrated. This avoids blocking the sign-up flow during development.

- [ ] **Step 2: Create `src/lib/auth-session.ts`**

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
```

- [ ] **Step 3: Create `src/app/api/auth/[...all]/route.ts`**

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

- [ ] **Step 4: Delete `src/app/api/auth/[...nextauth]/route.ts`**

```bash
rm src/app/api/auth/\[...nextauth\]/route.ts
rmdir src/app/api/auth/\[...nextauth\]
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-session.ts "src/app/api/auth/[...all]/route.ts"
git commit -m "feat: set up Better Auth server config with Prisma adapter"
```

---

## Task 3: Set up Better Auth client

**Files:**
- Create: `src/lib/auth-client.ts`
- Delete: `src/components/providers/session-provider.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Delete: `src/types/next-auth.d.ts`

- [ ] **Step 1: Create `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

- [ ] **Step 2: Remove SessionProvider from layout**

In `src/app/[locale]/layout.tsx`, remove the `SessionProvider` import and wrapper.

Change:
```tsx
import { SessionProvider } from "@/components/providers/session-provider";
```
to remove this import entirely.

Change the return JSX from:
```tsx
    <NextIntlClientProvider messages={messages}>
      <SessionProvider>
        <AnimatedBackground />
        <Navbar />
        <main id="main-content" className="relative z-[2] min-h-screen pt-16 pb-16 sm:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <Toaster />
        <FeedbackWidget />
        <TailwindIndicator />
      </SessionProvider>
    </NextIntlClientProvider>
```

To:
```tsx
    <NextIntlClientProvider messages={messages}>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="relative z-[2] min-h-screen pt-16 pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <Toaster />
      <FeedbackWidget />
      <TailwindIndicator />
    </NextIntlClientProvider>
```

- [ ] **Step 3: Delete old files**

```bash
rm src/components/providers/session-provider.tsx
rm src/types/next-auth.d.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth-client.ts src/app/\[locale\]/layout.tsx
git commit -m "feat: set up Better Auth client, remove SessionProvider"
```

---

## Task 4: Migrate auth page components (login, register)

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/register-form.tsx`
- Delete: `src/lib/validations/auth.ts`

- [ ] **Step 1: Rewrite login form submission**

In `src/components/auth/login-form.tsx`:

Replace the imports:
```typescript
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
```
With:
```typescript
import { authClient } from "@/lib/auth-client";
```

Replace the form type and validation. Remove the `zodResolver` and `useForm` generic type since Better Auth validates internally. Use simple form state:

```typescript
export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(t("invalidCredentials"));
        return;
      }

      router.push("/discover");
    } finally {
      setIsLoading(false);
    }
  }
```

Update the form tag from `<form onSubmit={handleSubmit(onSubmit)}>` to `<form onSubmit={onSubmit}>`.

Replace `{...register("email")}` with `name="email"` on the email input.
Replace `{...register("password")}` with `name="password"` on the password input.

Remove the `useForm` import from `react-hook-form`, the `zodResolver` import, and the `errors` destructuring. Remove the field-level error displays (the `{errors.email && ...}` blocks) — Better Auth returns a single error message.

Also remove these unused imports: `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod`.

- [ ] **Step 2: Rewrite register form submission**

In `src/components/auth/register-form.tsx`:

Replace imports:
```typescript
import { signIn } from "next-auth/react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
```
With:
```typescript
import { authClient } from "@/lib/auth-client";
```

Replace the form handling:

```typescript
export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (authError) {
        if (authError.message?.includes("already")) {
          setError(t("emailExists"));
        } else {
          setError(authError.message || t("invalidCredentials"));
        }
        return;
      }

      // autoSignIn: true in config means user is already logged in
      router.push("/onboarding");
    } finally {
      setIsLoading(false);
    }
  }
```

Update the form tag from `<form onSubmit={handleSubmit(onSubmit)}>` to `<form onSubmit={onSubmit}>`.

Replace `{...register("name")}` with `name="name"`, `{...register("email")}` with `name="email"`, `{...register("password")}` with `name="password"`.

Remove `useForm`, `zodResolver` imports and the `setError: setFieldError` destructuring. Remove field-level error displays.

- [ ] **Step 3: Delete `src/lib/validations/auth.ts`**

```bash
rm src/lib/validations/auth.ts
```

- [ ] **Step 4: Verify the app compiles**

```bash
npx next build 2>&1 | head -50
```

Expected: May still have errors from other files that still import `next-auth` — that's expected, we fix those in the next tasks.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/login-form.tsx src/components/auth/register-form.tsx
git commit -m "feat: migrate login and register forms to Better Auth client"
```

---

## Task 5: Migrate client components (useSession, signOut)

**Files:**
- Modify: `src/components/layout/navbar.tsx`
- Modify: `src/components/layout/user-menu.tsx`
- Modify: `src/components/dashboard/candidate/profile-settings.tsx`
- Modify: `src/components/dashboard/profile-editor.tsx`
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Modify: `src/components/company/claim-company-modal.tsx`
- Modify: `src/components/events/events-client.tsx`
- Modify: `src/components/jobs/job-card.tsx`
- Modify: `src/components/jobs/job-detail.tsx`
- Modify: `src/components/shared/follow-button.tsx`

All 10 components follow the same migration pattern. For each file:

**Import change:**
```typescript
// REMOVE:
import { useSession } from "next-auth/react";
// or
import { useSession, signOut } from "next-auth/react";
// or
import { signOut } from "next-auth/react";

// ADD:
import { authClient } from "@/lib/auth-client";
```

**useSession change:**
```typescript
// REMOVE:
const { data: session, status } = useSession();
// or
const { data: session } = useSession();

// ADD:
const { data: session, isPending } = authClient.useSession();
```

**Status check change:**
```typescript
// REMOVE:
if (status === "loading") ...
// ADD:
if (isPending) ...

// REMOVE:
if (status === "authenticated") ...
// ADD:
if (session) ...
```

**Session property access stays the same:**
- `session?.user?.id` — works as-is
- `session?.user?.name` — works as-is
- `session?.user?.email` — works as-is
- `session?.user?.role` — works as-is

- [ ] **Step 1: Migrate `src/components/layout/navbar.tsx`**

Replace:
```typescript
import { useSession } from "next-auth/react";
```
With:
```typescript
import { authClient } from "@/lib/auth-client";
```

Replace:
```typescript
const { data: session, status } = useSession();
```
With:
```typescript
const { data: session, isPending } = authClient.useSession();
```

If `status === "loading"` is used in the JSX, replace with `isPending`. If `status === "authenticated"` is used, replace with `!!session`.

- [ ] **Step 2: Migrate `src/components/layout/user-menu.tsx`**

Replace:
```typescript
import { useSession, signOut } from "next-auth/react";
```
With:
```typescript
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
```

Replace:
```typescript
const { data: session } = useSession();
```
With:
```typescript
const { data: session } = authClient.useSession();
```

Replace the sign-out handler (lines 204-210):
```typescript
<DropdownMenuItem
  onClick={async () => {
    document.cookie = "pit-active-context=; path=/; max-age=0";
    document.cookie = "next-auth.session-token=; path=/; max-age=0";
    document.cookie = "__Secure-next-auth.session-token=; path=/; max-age=0";
    await signOut({ callbackUrl: "/en/login" });
  }}
  variant="destructive"
>
```
With:
```typescript
<DropdownMenuItem
  onClick={async () => {
    document.cookie = "pit-active-context=; path=/; max-age=0";
    await authClient.signOut();
    router.push("/login");
  }}
  variant="destructive"
>
```

Note: `router` is already imported and available in this component (`useRouter` from `@/i18n/navigation` at line 5).

- [ ] **Step 3: Migrate `src/components/dashboard/candidate/profile-settings.tsx`**

Replace:
```typescript
import { signOut } from "next-auth/react";
```
With:
```typescript
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
```

In the `handleDeleteAccount` function, replace:
```typescript
document.cookie = "pit-active-context=; path=/; max-age=0";
document.cookie = "next-auth.session-token=; path=/; max-age=0";
document.cookie = "__Secure-next-auth.session-token=; path=/; max-age=0";
await signOut({ callbackUrl: "/en/login" });
```
With:
```typescript
document.cookie = "pit-active-context=; path=/; max-age=0";
await authClient.signOut();
router.push("/login");
```

Add `const router = useRouter();` at the top of the `ProfileSettings` component function body.

- [ ] **Step 4: Migrate remaining 7 components**

Apply the same import + useSession pattern to each:

1. `src/components/dashboard/profile-editor.tsx` — swap `useSession` import and call
2. `src/components/onboarding/onboarding-wizard.tsx` — swap `useSession` import and call. Note: this component uses `sessionStatus` — rename `isPending` to match: `const { data: session, isPending: sessionLoading } = authClient.useSession()` and replace `sessionStatus === "loading"` with `sessionLoading`, `sessionStatus === "authenticated"` with `!!session`.
3. `src/components/company/claim-company-modal.tsx` — swap `useSession` import and call
4. `src/components/events/events-client.tsx` — swap `useSession` import and call
5. `src/components/jobs/job-card.tsx` — swap `useSession` import and call
6. `src/components/jobs/job-detail.tsx` — swap `useSession` import and call
7. `src/components/shared/follow-button.tsx` — swap `useSession` import and call

For each file, the pattern is identical to Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/navbar.tsx src/components/layout/user-menu.tsx src/components/dashboard/candidate/profile-settings.tsx src/components/dashboard/profile-editor.tsx src/components/onboarding/onboarding-wizard.tsx src/components/company/claim-company-modal.tsx src/components/events/events-client.tsx src/components/jobs/job-card.tsx src/components/jobs/job-detail.tsx src/components/shared/follow-button.tsx
git commit -m "feat: migrate all client components from NextAuth to Better Auth"
```

---

## Task 6: Migrate server-side API routes (41 files)

**Files:** All 41 API route files listed below.

Every file follows the exact same mechanical replacement:

**Import change:**
```typescript
// REMOVE these two lines:
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ADD this one line:
import { getSession } from "@/lib/auth-session";
```

**Session call change:**
```typescript
// REMOVE:
const session = await getServerSession(authOptions);

// ADD:
const session = await getSession();
```

Everything else stays the same — `session.user.id`, `session.user.role`, `session?.user` checks all work identically.

- [ ] **Step 1: Migrate admin API routes (21 files)**

Apply the import + session call replacement to each:

```
src/app/api/admin/analytics/route.ts
src/app/api/admin/candidates/route.ts
src/app/api/admin/claims/route.ts
src/app/api/admin/claims/[id]/route.ts
src/app/api/admin/companies/route.ts
src/app/api/admin/companies/[id]/route.ts
src/app/api/admin/companies/[id]/enrich/route.ts
src/app/api/admin/companies/[id]/import-jobs/route.ts
src/app/api/admin/companies/[id]/scrape-jobs/route.ts
src/app/api/admin/content/route.ts
src/app/api/admin/events/route.ts
src/app/api/admin/events/[id]/route.ts
src/app/api/admin/jobs/route.ts
src/app/api/admin/jobs/[id]/route.ts
src/app/api/admin/newsletters/route.ts
src/app/api/admin/newsletters/[id]/route.ts
src/app/api/admin/partners/route.ts
src/app/api/admin/partners/[id]/route.ts
src/app/api/admin/partners/fetch-logo/route.ts
src/app/api/admin/partners/upload-logo/route.ts
```

Note: skip `src/app/api/auth/resend-verification/route.ts` — it will be deleted in Task 8.

- [ ] **Step 2: Migrate user-facing API routes (14 files)**

Apply the same replacement to:

```
src/app/api/profile/route.ts
src/app/api/profile/upload-avatar/route.ts
src/app/api/candidate/profile/route.ts
src/app/api/candidate/alerts/read/route.ts
src/app/api/onboarding/route.ts
src/app/api/onboarding/status/route.ts
src/app/api/claims/route.ts
src/app/api/companies/list-request/route.ts
src/app/api/companies/[id]/follow/route.ts
src/app/api/events/[id]/register/route.ts
src/app/api/events/[id]/save/route.ts
src/app/api/jobs/[id]/save/route.ts
src/app/api/dashboard/company/profile/route.ts
src/app/api/dashboard/company/upload/route.ts
```

- [ ] **Step 3: Migrate company dashboard API routes (6 files)**

Apply the same replacement to:

```
src/app/api/dashboard/company/analytics/route.ts
src/app/api/dashboard/company/gallery/route.ts
src/app/api/dashboard/company/events/route.ts
src/app/api/dashboard/company/events/[id]/route.ts
src/app/api/dashboard/company/jobs/route.ts
src/app/api/dashboard/company/jobs/[id]/route.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: migrate all 41 API routes from getServerSession to Better Auth"
```

---

## Task 7: Migrate server page components (7 files)

**Files:**
- Modify: `src/app/[locale]/(main)/dashboard/page.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/company/page.tsx`
- Modify: `src/app/[locale]/(main)/dashboard/profile/page.tsx`
- Modify: `src/app/[locale]/(main)/admin/page.tsx`
- Modify: `src/app/[locale]/(main)/events/page.tsx`
- Modify: `src/app/[locale]/(main)/companies/[slug]/page.tsx`

Same mechanical replacement as Task 6:

**Import change:**
```typescript
// REMOVE:
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ADD:
import { getSession } from "@/lib/auth-session";
```

**Session call change:**
```typescript
// REMOVE:
const session = await getServerSession(authOptions);

// ADD:
const session = await getSession();
```

- [ ] **Step 1: Migrate all 7 server page components**

Apply the replacement to each file listed above.

Example — `src/app/[locale]/(main)/admin/page.tsx` changes from:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// ...
const session = await getServerSession(authOptions);
```
To:
```typescript
import { getSession } from "@/lib/auth-session";
// ...
const session = await getSession();
```

The rest of each file (session checks, role checks, redirects) stays the same.

- [ ] **Step 2: Commit**

```bash
git add src/app/\[locale\]/
git commit -m "feat: migrate 7 server page components to Better Auth session"
```

---

## Task 8: Delete old auth API routes and update middleware

**Files:**
- Delete: `src/app/api/auth/register/route.ts`
- Delete: `src/app/api/auth/verify-email/route.ts`
- Delete: `src/app/api/auth/forgot-password/route.ts`
- Delete: `src/app/api/auth/reset-password/route.ts`
- Delete: `src/app/api/auth/resend-verification/route.ts`
- Modify: `src/middleware.ts`

- [ ] **Step 1: Delete old auth routes**

```bash
rm src/app/api/auth/register/route.ts
rm src/app/api/auth/verify-email/route.ts
rm src/app/api/auth/forgot-password/route.ts
rm src/app/api/auth/reset-password/route.ts
rm src/app/api/auth/resend-verification/route.ts
```

Also clean up empty directories:
```bash
rmdir src/app/api/auth/register src/app/api/auth/verify-email src/app/api/auth/forgot-password src/app/api/auth/reset-password src/app/api/auth/resend-verification 2>/dev/null
```

- [ ] **Step 2: Update middleware with auth-aware routing**

Rewrite `src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard", "/admin", "/onboarding", "/profile"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Strip locale prefix for matching (e.g. /en/dashboard → /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|el)/, "") || "/";

  // Redirect authenticated users away from login/register
  if (sessionCookie && authRoutes.some((r) => pathWithoutLocale.startsWith(r))) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!sessionCookie && protectedRoutes.some((r) => pathWithoutLocale.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 3: Commit**

```bash
git add -A src/app/api/auth/ src/middleware.ts
git commit -m "feat: delete old auth routes, add auth-aware middleware"
```

---

## Task 9: Verify build and test auth flows

- [ ] **Step 1: Check for any remaining next-auth imports**

```bash
grep -r "next-auth" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: No results. If any files are found, apply the same migration pattern from Tasks 5-7.

- [ ] **Step 2: Check for any remaining authOptions imports**

```bash
grep -r "authOptions" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: No results.

- [ ] **Step 3: Run the build**

```bash
npx next build
```

Expected: Build succeeds with no errors. Fix any type errors or missing imports.

- [ ] **Step 4: Start the dev server and test auth flows**

```bash
npm run dev
```

Test manually:
1. Navigate to `/register` — create a new account → should redirect to `/onboarding`
2. Navigate to `/login` — sign in with the account → should redirect to `/discover`
3. Check the Neon DB — `user` and `session` tables should have rows
4. Click sign out in user menu → should redirect to `/login`
5. Try accessing `/dashboard` while logged out → middleware redirects to `/login`
6. Try accessing `/login` while logged in → middleware redirects to `/discover`
7. Test admin access — sign in as ADMIN user → `/admin` should load
8. Test context switching for COMPANY_REP users

- [ ] **Step 5: Commit any build fixes**

```bash
git add -A
git commit -m "fix: resolve build errors from auth migration"
```

---

## Task 10: Clean up and final commit

- [ ] **Step 1: Remove any leftover empty directories**

```bash
find src/app/api/auth -type d -empty -delete 2>/dev/null
```

- [ ] **Step 2: Verify no secrets in committed files**

```bash
grep -r "BETTER_AUTH_SECRET\|DATABASE_URL\|postgresql://" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: No results (all secrets should be in .env only).

- [ ] **Step 3: Verify .env is in .gitignore**

```bash
grep "^\.env" .gitignore
```

Expected: `.env` is listed.

- [ ] **Step 4: Final build check**

```bash
npx next build
```

Expected: Clean build, no warnings related to auth.

- [ ] **Step 5: Final commit if needed**

```bash
git add -A
git commit -m "chore: clean up auth migration artifacts"
```

---

## Execution Order Summary

| Task | Description | Files Changed | Effort |
|------|-------------|--------------|--------|
| 1 | Install deps, swap DB provider | 4 + schema | ~15 min |
| 2 | Better Auth server config | 3 created, 1 deleted | ~10 min |
| 3 | Better Auth client + remove SessionProvider | 2 created, 2 deleted, 1 modified | ~5 min |
| 4 | Migrate login + register forms | 2 modified, 1 deleted | ~10 min |
| 5 | Migrate 10 client components | 10 modified | ~15 min |
| 6 | Migrate 41 API routes | 41 modified | ~20 min |
| 7 | Migrate 7 server pages | 7 modified | ~10 min |
| 8 | Delete old routes + update middleware | 5 deleted, 1 modified | ~10 min |
| 9 | Build verification + manual testing | 0 | ~15 min |
| 10 | Cleanup | 0 | ~5 min |

**Total: ~60 files changed, ~115 min estimated**
