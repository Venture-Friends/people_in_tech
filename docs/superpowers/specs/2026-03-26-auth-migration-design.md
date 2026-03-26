# Auth Migration: NextAuth v4 + SQLite to Better Auth + Neon Postgres

**Date:** 2026-03-26
**Status:** Approved
**Scope:** Replace authentication system and database layer in one migration

---

## Goals

1. Replace NextAuth v4 (legacy, broken sign-out) with Better Auth (active, database sessions)
2. Migrate from SQLite (incompatible with Vercel) to Neon Postgres (serverless, production-ready)
3. Simplify auth surface area — delete custom email verification and password reset routes in favor of Better Auth built-ins
4. Add middleware-level route protection
5. Support Tailscale IP for testing via `NEXT_PUBLIC_APP_URL` env var

## Non-Goals

- Social login (Google, GitHub, LinkedIn) — deferred, easy to add later
- Resend email integration — deferred, console stub for now
- Data migration — fresh DB, this is dev/test data only
- RBAC plugin — simple role string on User is sufficient (3 roles)

---

## Architecture

### Database: SQLite to Neon Postgres

- **Prisma provider**: `sqlite` -> `postgresql`
- **Connection**: File path -> `DATABASE_URL` env var pointing to Neon
- **Schema changes**:
  - Better Auth tables added: `session`, `account`, `verification` (generated via `npx @better-auth/cli generate`)
  - Tables removed: `EmailVerificationToken`, `PasswordResetToken` (Better Auth handles these via `verification` table)
  - User model gains Better Auth's expected fields; custom fields declared via `additionalFields`
- **No data migration**: Fresh DB on Neon, seed if needed

### Auth Server Config

**File: `src/lib/auth.ts`** — complete rewrite

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
    requireEmailVerification: true,
    minPasswordLength: 6,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // Console stub — Resend integration later
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Console stub — Resend integration later
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
      maxAge: 5 * 60, // 5 min cache to reduce DB reads
    },
  },
});
```

### Auth API Route Handler

**File: `src/app/api/auth/[...all]/route.ts`** — replaces `[...nextauth]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Auth Client

**File: `src/lib/auth-client.ts`** — new file

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

### Server-Side Session Helper

**File: `src/lib/auth-session.ts`** — new file, avoids repeating `headers()` boilerplate in 48 files

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
```

Usage in API routes:
```typescript
import { getSession } from "@/lib/auth-session";
const session = await getSession();
```

---

## Client-Side Migration Map

| Current (NextAuth) | New (Better Auth) |
|---|---|
| `import { useSession } from "next-auth/react"` | `import { authClient } from "@/lib/auth-client"` |
| `const { data: session, status } = useSession()` | `const { data, isPending, error } = authClient.useSession()` |
| `session?.user?.id` | `data?.user?.id` |
| `session?.user?.role` | `data?.user?.role` |
| `status === "loading"` | `isPending` |
| `status === "authenticated"` | `!!data && !error` |
| `signIn("credentials", { email, password, redirect: false })` | `authClient.signIn.email({ email, password })` |
| `signOut({ callbackUrl: "/en/login" })` | `authClient.signOut()` then `router.push("/login")` |
| `<SessionProvider>` wrapping app | **Removed** — not needed |

### 12 Client Components to Update

1. `src/components/auth/login-form.tsx` — swap `signIn()` call
2. `src/components/auth/register-form.tsx` — swap to `authClient.signUp.email()`, remove manual POST
3. `src/components/layout/user-menu.tsx` — swap `useSession` + `signOut`
4. `src/components/layout/navbar.tsx` — swap `useSession`
5. `src/components/dashboard/profile-editor.tsx` — swap `useSession`
6. `src/components/dashboard/candidate/profile-settings.tsx` — swap `signOut`
7. `src/components/onboarding/onboarding-wizard.tsx` — swap `useSession`
8. `src/components/company/claim-company-modal.tsx` — swap `useSession`
9. `src/components/events/events-client.tsx` — swap `useSession`
10. `src/components/jobs/job-card.tsx` — swap `useSession`
11. `src/components/jobs/job-detail.tsx` — swap `useSession`
12. `src/components/shared/follow-button.tsx` — swap `useSession`

---

## Server-Side Migration (48 endpoints)

All 41 API routes + 7 page components replace:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const session = await getServerSession(authOptions);
```
With:
```typescript
import { getSession } from "@/lib/auth-session";
const session = await getSession();
```

Session shape stays the same: `session.user.id`, `session.user.name`, `session.user.email`, `session.user.role`.

---

## Middleware

**File: `src/middleware.ts`** — add auth-aware routing alongside existing i18n

Uses `getSessionCookie` from `better-auth/cookies` (lightweight, no DB hit):

- **Protected routes** (`/dashboard`, `/admin`, `/onboarding`, `/profile`): redirect to `/login` if no session cookie
- **Auth routes** (`/login`, `/register`): redirect to `/discover` if session cookie exists
- Strips locale prefix before matching (e.g. `/en/dashboard` -> `/dashboard`)
- Optimistic check only — real session validation happens in `getSession()` calls

---

## Auth Pages

**Login form** — same UI, handler changes to `authClient.signIn.email({ email, password })`

**Register form** — same UI, handler changes to `authClient.signUp.email({ name, email, password })`. Remove manual POST to `/api/auth/register`. `autoSignIn: true` means user is logged in immediately.

**Forgot password** — `authClient.forgetPassword({ email, redirectTo: "/reset-password" })`

**Reset password** — `authClient.resetPassword({ newPassword, token })`

**Sign-out** (user-menu.tsx and profile-settings.tsx):
```typescript
onClick={async () => {
  document.cookie = "pit-active-context=; path=/; max-age=0";
  await authClient.signOut();
  router.push("/login");
}}
```

---

## Files Deleted

**API routes (6):**
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/resend-verification/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`

**Config/types (3):**
- `src/components/providers/session-provider.tsx`
- `src/types/next-auth.d.ts`
- `src/lib/validations/auth.ts`

**Prisma models (2):**
- `EmailVerificationToken`
- `PasswordResetToken`

## Files Created

- `src/lib/auth-client.ts` — client-side auth
- `src/lib/auth-session.ts` — server-side session helper
- `src/app/api/auth/[...all]/route.ts` — Better Auth handler

## Dependencies

**Removed:** `next-auth`, `bcryptjs`, `@types/bcryptjs`
**Added:** `better-auth`

---

## Environment Variables

```env
# Neon Postgres
DATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/people_in_tech?sslmode=require"

# Better Auth (auto-detected from env — no need to pass in code)
BETTER_AUTH_SECRET="..."   # generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://100.x.x.x:3000"  # Tailscale IP for testing, Vercel URL for production

# Client-side app URL (used by auth-client.ts)
NEXT_PUBLIC_APP_URL="http://100.x.x.x:3000"  # must match BETTER_AUTH_URL
```

---

## Testing Plan

1. Register a new user — verify account created in Neon, email verification console log appears
2. Log in — verify session row created in `session` table
3. Access protected pages — verify session is read correctly, user data available
4. Sign out — verify session row deleted, cookie cleared, redirect to `/login`
5. Hit `/dashboard` while logged out — middleware redirects to `/login`
6. Hit `/login` while logged in — middleware redirects to `/discover`
7. Forgot password flow — verify console log with reset URL
8. Reset password — verify password updated, can log in with new password
9. Admin routes — verify role check still works (`session.user.role === "ADMIN"`)
10. Context switching (COMPANY_REP) — verify `pit-active-context` cookie still works
11. Test all above via Tailscale IP
