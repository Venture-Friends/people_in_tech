# PR G: Auth Pages Branding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move login and register pages from the `(auth)` layout to the `(main)` layout so they get the animated background, navbar, and footer.

**Architecture:** Move the page files from `(auth)` to `(main)`, wrap forms in a centering container, delete the `(auth)` layout. The forms themselves (LoginForm, RegisterForm) stay unchanged.

**Tech Stack:** Next.js 16, React, Tailwind CSS

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Move | `src/app/[locale]/(auth)/login/page.tsx` → `src/app/[locale]/(main)/login/page.tsx` | Login page |
| Move | `src/app/[locale]/(auth)/register/page.tsx` → `src/app/[locale]/(main)/register/page.tsx` | Register page |
| Delete | `src/app/[locale]/(auth)/layout.tsx` | Old auth layout |
| Delete | `src/app/[locale]/(auth)/` | Empty directory |

---

### Task 1: Move login and register pages

**Files:**
- Move: `src/app/[locale]/(auth)/login/page.tsx` → `src/app/[locale]/(main)/login/page.tsx`
- Move: `src/app/[locale]/(auth)/register/page.tsx` → `src/app/[locale]/(main)/register/page.tsx`

- [ ] **Step 1: Create directories and move files**

```bash
mkdir -p "src/app/[locale]/(main)/login"
mkdir -p "src/app/[locale]/(main)/register"
cp "src/app/[locale]/(auth)/login/page.tsx" "src/app/[locale]/(main)/login/page.tsx"
cp "src/app/[locale]/(auth)/register/page.tsx" "src/app/[locale]/(main)/register/page.tsx"
```

- [ ] **Step 2: Update login page with centering wrapper**

Replace content of `src/app/[locale]/(main)/login/page.tsx`:

```typescript
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            People in Tech<span className="text-primary">.</span>
          </h1>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update register page with centering wrapper**

Replace content of `src/app/[locale]/(main)/register/page.tsx`:

```typescript
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            People in Tech<span className="text-primary">.</span>
          </h1>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Delete old auth layout and pages**

```bash
rm -rf "src/app/[locale]/(auth)"
```

- [ ] **Step 5: Check middleware for auth route references**

Read `src/middleware.ts` or `src/proxy.ts` and check if there are any references to `/(auth)/` paths that need updating. The route paths (`/login`, `/register`) stay the same — only the layout group changes, so middleware should not need changes. Verify.

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```
Ignore pre-existing switch.tsx error.

Test by visiting `/login` and `/register` — should show animated background, navbar, and centered form.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: move auth pages to main layout for consistent branding"
```
