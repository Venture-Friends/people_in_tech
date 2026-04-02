# PR I: Profile Editor Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix profile editor UX based on feedback: move edit/preview toggle to right, match option boxes to onboarding style, replace email notifications with single contact toggle.

**Architecture:** Modify profile-editor.tsx layout, update section components to use consistent multi-select patterns, replace the Account section's email toggles with the single `allowContactEmail` toggle.

**Tech Stack:** Next.js 16, React 19, react-hook-form, Tailwind CSS

**Depends on:** PR F (needs `allowContactEmail` field in Prisma schema)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/components/dashboard/profile-editor.tsx` | Move toggle, replace email section |
| Modify | `src/components/dashboard/profile/types.ts` | Replace email fields with allowContactEmail |
| Modify | `src/components/dashboard/profile/section-skills.tsx` | Verify/align with onboarding style |

---

### Task 1: Move edit/preview toggle to right side

**Files:**
- Modify: `src/components/dashboard/profile-editor.tsx`

- [ ] **Step 1: Read the current toggle section**

Read `src/components/dashboard/profile-editor.tsx` and find the edit/preview tab switcher (around lines 298-323). Currently it's centered.

- [ ] **Step 2: Move to right-aligned layout**

Update the toggle container to use `justify-end` instead of centered. The toggle should be in the page header area, right-aligned next to the "My Profile" heading. Change the toggle wrapper:

Old pattern (centered):
```typescript
<div className="flex justify-center gap-2 mb-6">
```

New pattern (right-aligned in header):
```typescript
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="font-display text-lg font-semibold text-white">Edit Profile</h2>
  </div>
  <div className="flex gap-2">
    {/* Edit/Preview buttons stay the same */}
  </div>
</div>
```

Adjust based on the actual current layout — the key change is moving the toggle to the right.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/profile-editor.tsx
git commit -m "fix: move edit/preview toggle to right side of header"
```

---

### Task 2: Replace email notifications with contact toggle

**Files:**
- Modify: `src/components/dashboard/profile/types.ts`
- Modify: `src/components/dashboard/profile-editor.tsx`

- [ ] **Step 1: Update ProfileFormData type**

In `src/components/dashboard/profile/types.ts`, replace:
```typescript
  emailDigest: boolean;
  emailEvents: boolean;
  emailNewsletter: boolean;
```

With:
```typescript
  allowContactEmail: boolean;
```

- [ ] **Step 2: Update profile editor defaults and form**

In `src/components/dashboard/profile-editor.tsx`:

Update `defaultFormValues`:
- Remove: `emailDigest: true, emailEvents: true, emailNewsletter: false,`
- Add: `allowContactEmail: true,`

Update the watch calls:
- Remove: `const emailDigest = watch("emailDigest");` etc.
- Add: `const allowContactEmail = watch("allowContactEmail");`

Update the Account section JSX — replace the three email toggle switches with a single toggle:

```typescript
          {/* Account */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 space-y-6">
            <h3 className="font-display text-base font-semibold text-white">
              Account
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowContactEmail" className="cursor-pointer text-sm text-white/60">
                  Allow companies to contact me via email
                </Label>
                <p className="text-[11px] text-white/25 mt-0.5">
                  Companies you express interest in can reach out to you
                </p>
              </div>
              <Switch
                id="allowContactEmail"
                checked={allowContactEmail}
                onCheckedChange={(checked: boolean) => setValue("allowContactEmail", checked)}
              />
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-white/[0.05]">
              {/* ... existing delete account button and dialog ... */}
            </div>
          </div>
```

- [ ] **Step 3: Update the API call and data fetching**

In the profile editor, check where it fetches profile data (likely in a `useEffect` or `fetchProfile` function) and where it submits. Ensure:
- The GET response maps `allowContactEmail` from the API
- The PUT request sends `allowContactEmail` instead of the three email fields

Also update the profile API route (`src/app/api/profile/route.ts` or `src/app/api/candidate/profile/route.ts`) to read/write `allowContactEmail` instead of the three email fields.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/profile/types.ts src/components/dashboard/profile-editor.tsx
git commit -m "feat: replace email notifications with single contact toggle"
```

---

### Task 3: Verify option boxes match onboarding style

**Files:**
- Modify: `src/components/dashboard/profile/section-skills.tsx` (if needed)

- [ ] **Step 1: Compare onboarding and profile editor components**

Read `src/components/onboarding/step-interests.tsx` and `src/components/dashboard/profile/section-skills.tsx`. Compare how they render:
- Role interests
- Skills
- Industries

Both should use `ComboboxMultiSelect` for role interests and industries, and `SkillPicker` for skills. If the profile editor uses different components (e.g., plain text inputs or raw tag lists), update to use the same components as onboarding.

- [ ] **Step 2: Align if needed**

If the section-skills component uses different UI patterns, update it to use `ComboboxMultiSelect` and `SkillPicker` matching the onboarding step. Import from the same shared components.

- [ ] **Step 3: Commit (if changes needed)**

```bash
git add src/components/dashboard/profile/section-skills.tsx
git commit -m "fix: align profile editor option boxes with onboarding style"
```
