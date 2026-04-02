# Execution Prompt: Implement Round 3 PRs (F, G, H, I)

## Instructions

You are implementing 4 PRs for the People in Tech platform. Each PR has a detailed implementation plan in `docs/superpowers/plans/`. Your job is to execute each plan task-by-task, verify the work compiles, push each branch, and **create a GitHub PR** for each one so the user can review them before merging.

## Important Rules

1. **Read each plan file before starting it** — they contain exact file paths, code blocks, and commit messages
2. **Create a new branch from `main` for each PR** — branch naming below
3. **Commit per task** as specified in the plans
4. **Run `npx tsc --noEmit`** after completing each PR to verify no type errors (ignore the pre-existing `switch.tsx:16` error)
5. **After completing each PR branch**: push and create a GitHub PR using `gh pr create`
6. **Use `superpowers:subagent-driven-development`** to dispatch parallel work where the dependency graph allows
7. **After ALL 4 PRs are created**: report a summary with links to all PRs

## Dependency Graph & Execution Order

```
Phase A (first, touches schema):
  PR F: Onboarding Revert — adds allowContactEmail field

Phase B (parallel, after PR F schema push):
  PR G: Auth Pages Branding — independent of F's code, just needs same main
  PR I: Profile Editor Fixes — needs allowContactEmail from PR F

Phase C (after PR F):
  PR H: Profile Access + Express Interest — needs JobInterest schema, can start after F
```

**CRITICAL**: PR F adds `allowContactEmail` to the Prisma schema. After completing PR F's branch, merge it into `main` locally and push before starting PRs G, H, I:
```bash
git checkout main
git merge fix/pr-f-onboarding-revert
git push origin main
```

PR H adds `JobInterest` model. After PR H, merge into main:
```bash
git checkout main
git merge fix/pr-h-profile-access-interest
git push origin main
```

## Plan Files

| PR | Plan File | Branch Name |
|----|-----------|-------------|
| PR F | `docs/superpowers/plans/2026-04-02-pr-f-onboarding-revert.md` | `fix/pr-f-onboarding-revert` |
| PR G | `docs/superpowers/plans/2026-04-02-pr-g-auth-branding.md` | `fix/pr-g-auth-branding` |
| PR H | `docs/superpowers/plans/2026-04-02-pr-h-profile-access-interest.md` | `fix/pr-h-profile-access-interest` |
| PR I | `docs/superpowers/plans/2026-04-02-pr-i-profile-editor-fixes.md` | `fix/pr-i-profile-editor-fixes` |

## Per-PR Workflow

For each PR:

```bash
# 1. Start from main (with all prior PR merges)
git checkout main
git pull origin main

# 2. Create branch
git checkout -b fix/prX-name

# 3. Read the plan file
# Read docs/superpowers/plans/2026-04-02-pr-X-*.md

# 4. Execute each task, committing after each one as specified in the plan

# 5. Type-check
npx tsc --noEmit  # ignore switch.tsx:16 error

# 6. Push and create PR
git push -u origin fix/prX-name
gh pr create --title "PR title" --body "$(cat <<'EOF'
## Summary
- bullet points of what was done

## Test plan
- [ ] manual test steps

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# 7. Merge into main locally for dependent PRs (only when specified)
git checkout main
git merge fix/prX-name
git push origin main
```

## PR Descriptions

| PR | Title | Summary |
|----|-------|---------|
| PR F | `fix: revert onboarding to original 3-step flow` | Revert to About → Interests → Preferences. Replace 3 email toggles with single "Allow companies to contact me" toggle. Delete email verification banner and CV upload from onboarding. |
| PR G | `feat: move auth pages to main layout for consistent branding` | Login/register pages get animated background, navbar, footer. Delete old (auth) layout. |
| PR H | `feat: express interest on jobs, restrict profile access` | Candidates can express interest in job listings. Profile pages restricted to admin + authorized company reps. Admin panel shows interested candidates per job. |
| PR I | `fix: profile editor UX improvements` | Move edit/preview toggle to right. Replace email notifications with single contact toggle. Align option boxes with onboarding style. |

## Context

- **Tech stack**: Next.js 16, React 19, Prisma, PostgreSQL (Neon), Better Auth, Tailwind CSS, Framer Motion, next-intl
- **Auth**: Better Auth (NOT NextAuth). Session helper: `getSession()` from `@/lib/auth-session`
- **Design system**: Dark theme, glassmorphic — `bg-white/[0.02]`, `border-white/[0.05]`, `backdrop-blur-[8px]`, `rounded-2xl`, `font-display` for headings
- **Prisma**: Uses `@@map()` for table names, JSON arrays stored as strings, `cuid()` for IDs
- **i18n**: next-intl with `src/messages/en.json` and `src/messages/el.json`

## What Was Already Done (Context for the Implementer)

PRs A-E from the previous round are already merged into main:
- **PR A**: Dashboard Settings tab removed, profile editing consolidated at `/dashboard/profile`
- **PR B**: Onboarding was redesigned to 3 steps (this is what PR F reverts from)
- **PR C**: pdf-parse dynamic import fix (CV upload works now)
- **PR D**: Gatekeeping copy updated with value-focused messaging
- **PR E**: Newsletter admin composer removed

The current onboarding wizard imports `StepAbout`, `StepInterests`, and `StepCvUpload`. PR F will change it to import `StepAbout`, `StepInterests`, and `StepPreferences` (new file).

## After All PRs Are Created

Once all 4 PRs exist on GitHub:

1. List all PR URLs in a summary table
2. For each PR, show: number of commits, files changed, and any deviations from the plan
3. Wait for the user to review each PR before merging
