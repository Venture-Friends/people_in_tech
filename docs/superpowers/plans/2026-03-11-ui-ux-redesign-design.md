# UI/UX Systematic Elevation — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework design tokens and shared components to achieve a Modern Minimal Dark aesthetic (Linear/Vercel/Raycast), then cascade across all pages.

**Architecture:** Token-first approach — update CSS custom properties in `globals.css`, then update shared components (cards, navbar, footer), then page-specific components. All changes are visual/interaction only; no functionality changes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (CSS-based config), shadcn/ui v4 (base-nova), Lucide icons, next-intl, Recharts

**Spec:** `docs/superpowers/specs/2026-03-11-ui-ux-redesign-design.md`

---

## Chunk 1: Design Tokens & Foundation

### Task 1: Update Color Tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `:root` color values**

In `src/app/globals.css`, update these values in both the `:root` and `.dark` blocks:

```css
/* CHANGE these values: */
--background: oklch(0.11 0.01 260);      /* was oklch(0.13 0.02 260) */
--card: oklch(0.14 0.01 260);            /* was oklch(0.17 0.02 260) */
--card-foreground: oklch(0.97 0 0);      /* unchanged */
--primary: oklch(0.82 0.19 130);         /* was oklch(0.88 0.27 128) */
--primary-foreground: oklch(0.11 0.01 260); /* match new bg */
--ring: oklch(0.82 0.19 130);            /* match new primary */
--chart-1: oklch(0.82 0.19 130);         /* match new primary */
--sidebar: oklch(0.14 0.01 260);         /* match new card */
--sidebar-primary: oklch(0.82 0.19 130); /* match new primary */
--sidebar-primary-foreground: oklch(0.11 0.01 260);
--sidebar-ring: oklch(0.82 0.19 130);
--popover: oklch(0.21 0.01 260);           /* was oklch(0.21 0.02 255) — align chroma */
```

- [ ] **Step 2: Add surface-2 and surface-3 tokens to `:root` and `.dark`**

Add after `--card-foreground`:

```css
--surface-2: oklch(0.17 0.01 260);
--surface-3: oklch(0.21 0.01 260);
```

- [ ] **Step 3: Register surface tokens in `@theme inline`**

Add to the `@theme inline` block:

```css
--color-surface-2: var(--surface-2);
--color-surface-3: var(--surface-3);
```

- [ ] **Step 4: Build to verify no errors**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(tokens): update color system — deeper bg, desaturated primary, add surface tiers"
```

---

### Task 2: Update Shadows, Transitions, and Icon Tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace glow shadow tokens with elevation shadows in `@theme inline`**

Remove these three lines from `@theme inline`:
```css
--shadow-glow-sm: 0 0 10px rgba(159, 239, 0, 0.06);
--shadow-glow-md: 0 0 20px rgba(159, 239, 0, 0.08);
--shadow-glow-lg: 0 0 40px rgba(159, 239, 0, 0.12);
```

Add in their place:
```css
--shadow-elevation-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-elevation-md: 0 2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
--shadow-elevation-lg: 0 4px 8px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.05);
```

- [ ] **Step 2: Add transition tokens to `:root`**

Add after the `--sidebar-ring` line in `:root` (and `.dark`):

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

- [ ] **Step 3: Add icon size tokens to `:root`**

Add after the transition tokens in `:root` (and `.dark`):

```css
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
```

- [ ] **Step 4: Remove `.card-glow` class**

Delete this entire block from `globals.css`:
```css
/* Glow hover effect for cards */
.card-glow:hover {
  box-shadow: 0 0 20px rgba(159, 239, 0, 0.08);
  border-color: rgba(159, 239, 0, 0.2);
}
```

- [ ] **Step 5: Update border base style**

In the `@layer base` block, update the border color:
```css
@layer base {
  * {
    @apply border-white/[0.06] outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 6: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(tokens): add elevation shadows, transitions, icon sizes; remove glow effects"
```

---

## Chunk 2: Shared Card Components

### Task 3: Redesign CompanyCard

**Files:**
- Modify: `src/components/shared/company-card.tsx`

- [ ] **Step 1: Update CompanyCard component**

Replace the entire `CompanyCard` function body. Key changes:
- Remove `card-glow` class
- Add hover lift + border brighten pattern: `hover:-translate-y-0.5 hover:border-white/[0.12]`
- Use `transition-all duration-200` (matches `--transition-normal`)
- Surface layering: card is `bg-card`, inner logo area uses `bg-surface-2`
- Badges: consistent `rounded-md bg-white/[0.06] border border-white/[0.04] text-xs` style
- Verification: simple lime `Check` icon next to company name (remove the Badge with text)
- Job count: lime-colored number
- All inline icons: `size-3.5` (14px)

Full replacement for the return statement in `CompanyCard`:

```tsx
return (
  <Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
    <CardContent className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="size-10 rounded-lg bg-surface-2 object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-white">
            {firstLetter}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/companies/${company.slug}`}
              className="block truncate font-semibold text-foreground hover:text-primary transition-colors"
            >
              {company.name}
            </Link>
            {company.status === "VERIFIED" && (
              <CheckCircle className="size-3.5 shrink-0 text-primary" />
            )}
          </div>
          <span className="mt-1 inline-block rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
            {company.industry}
          </span>
        </div>
      </div>

      {firstLocation && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{firstLocation}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Briefcase className="size-3.5" />
            <span className={company.jobCount > 0 ? "text-primary" : ""}>
              {company.jobCount}
            </span>{" "}
            open roles
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="size-3.5" />
            {company.followerCount}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

Remove the old verification Badge at the bottom and the `AlertCircle` import. Remove the `getIndustryColor` function (no longer needed for logo fallback — it now uses `bg-surface-2`).

Update imports: remove `AlertCircle`, `Badge`. Keep `CheckCircle`, `Heart`, `Briefcase`, `MapPin`.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/company-card.tsx
git commit -m "feat(company-card): redesign with lift hover, surface layering, simplified verification"
```

---

### Task 4: Redesign JobCard

**Files:**
- Modify: `src/components/jobs/job-card.tsx`

- [ ] **Step 1: Update JobCard component**

Key changes:
- Same hover pattern: `hover:-translate-y-0.5 hover:border-white/[0.12]`
- Company logo at 32px (`size-8`) with border
- Job type badge uses consistent style: `rounded-md bg-white/[0.06] border border-white/[0.04]`
- Save button gets hover circle: add `hover:bg-white/[0.08] rounded-full` and `aria-label="Save job"`
- "Apply" link styled as ghost button with arrow icon
- Remove `getIndustryColor` — use `bg-surface-2` for fallback

Update the Card className:
```tsx
<Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
```

Update the company logo to 32px:
```tsx
{job.company.logo ? (
  <img
    src={job.company.logo}
    alt={job.company.name}
    className="size-8 shrink-0 rounded-lg border border-white/[0.06] object-cover"
  />
) : (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-white">
    {firstLetter}
  </div>
)}
```

Update the save button:
```tsx
<Button
  variant="ghost"
  size="icon"
  className="shrink-0 rounded-full hover:bg-white/[0.08]"
  onClick={handleSave}
  disabled={saving}
  aria-label={saved ? "Remove saved job" : "Save job"}
>
  <Bookmark
    className={`size-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`}
  />
</Button>
```

Update type badge to consistent style (remove per-type coloring):
```tsx
<span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
  {typeBadge.label}
</span>
```

Update the apply link to ghost button with arrow:
```tsx
<a
  href={job.externalUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.08] hover:border-white/[0.12]"
>
  Apply
  <ArrowRight className="size-3" />
</a>
```

Add `ArrowRight` to imports, remove `ExternalLink`. Replace `getTypeBadge` with a simpler label-only function (since per-type coloring is removed):

```tsx
function formatJobType(type: string): string {
  switch (type) {
    case "REMOTE": return "Remote";
    case "HYBRID": return "Hybrid";
    case "ONSITE": return "Onsite";
    default: return type;
  }
}
```

Then use `{formatJobType(job.type)}` in the badge span instead of `{typeBadge.label}`.

Remove `getIndustryColor` function. Remove `Badge` import.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/jobs/job-card.tsx
git commit -m "feat(job-card): redesign with lift hover, ghost apply button, consistent badges"
```

---

### Task 5: Redesign EventCard

**Files:**
- Modify: `src/components/shared/event-card.tsx`

- [ ] **Step 1: Update EventCard component**

Key changes:
- Same hover pattern on Card
- Date block: `bg-surface-2` instead of `bg-muted`, smaller text, no monospace
- Event type badge: single consistent style with subtle left-border accent
- Icons at 14px (`size-3.5`)

Update Card className:
```tsx
<Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
```

Update date block:
```tsx
<div className="flex flex-col items-center justify-center rounded-lg bg-surface-2 px-3 py-2">
  <span className="text-xl font-bold text-foreground">
    {dayNumber}
  </span>
  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
    {monthShort}
  </span>
</div>
```

Update type badge to consistent style with left border accent:
```tsx
<span className={`inline-flex items-center rounded-md border-l-2 bg-white/[0.06] px-2 py-0.5 text-xs text-muted-foreground ${getTypeAccentBorder(event.type)}`}>
  {formatEventType(event.type)}
</span>
```

Replace `getTypeBadgeClass` with a simpler border-only accent function:
```tsx
function getTypeAccentBorder(type: string): string {
  switch (type) {
    case "WORKSHOP": return "border-l-blue-400";
    case "MEETUP": return "border-l-purple-400";
    case "WEBINAR": return "border-l-amber-400";
    case "TALENT_SESSION": return "border-l-primary";
    default: return "border-l-muted-foreground";
  }
}
```

Update icon sizes from `size-3` to `size-3.5`. Remove `Badge` import.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/event-card.tsx
git commit -m "feat(event-card): redesign with surface-2 date block, accent borders, lift hover"
```

---

### Task 6: Update StatsCard

**Files:**
- Modify: `src/components/shared/stats-card.tsx`

- [ ] **Step 1: Update StatsCard**

Key changes:
- Surface-1 bg, clean layout
- Remove colored icon backgrounds
- Use `border-white/[0.06]`

Update Card:
```tsx
<Card className={cn("border-white/[0.06] bg-card", className)}>
  <CardContent className="flex items-center gap-4">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2">
      <Icon className="size-5 text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    {trend && (
      <div
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
          trend.positive
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        )}
      >
        {trend.positive ? "+" : ""}
        {trend.value}%
      </div>
    )}
  </CardContent>
</Card>
```

Remove `font-mono` from the value display.

- [ ] **Step 2: Build and commit**

```bash
git add src/components/shared/stats-card.tsx
git commit -m "feat(stats-card): update to surface-2 icon bg, remove colored backgrounds"
```

---

## Chunk 3: Layout Components

### Task 7: Redesign Navbar (Desktop)

**Files:**
- Modify: `src/components/layout/navbar.tsx`

- [ ] **Step 1: Update header bar styling**

Update the header element:
```tsx
<header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-md">
```

- [ ] **Step 2: Update nav link hover to pill pattern**

Replace the nav link className logic:
```tsx
<Link
  key={link.href}
  href={link.href}
  className={cn(
    "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
    isActive
      ? "bg-white/[0.08] text-white"
      : "text-muted-foreground hover:bg-white/[0.06] hover:text-white"
  )}
>
  {t(link.labelKey)}
</Link>
```

Remove the active underline indicator `<span>` element (the pill bg replaces it).

- [ ] **Step 3: Promote Sign In to solid lime button**

Update the auth buttons section — make Sign In the primary CTA:
```tsx
<>
  <Button
    variant="ghost"
    size="sm"
    className="text-muted-foreground hover:text-white"
    render={<Link href="/login" />}
  >
    {t("signIn")}
  </Button>
  <Button size="sm" render={<Link href="/register" />}>
    {t("getStarted")}
  </Button>
</>
```

(Sign In stays ghost, Get Started stays primary lime — this matches having the primary CTA be the registration action.)

- [ ] **Step 4: Update mobile Sheet styling**

Update SheetContent:
```tsx
<SheetContent side="right" className="max-w-[280px] w-[85vw] p-0">
```

Update mobile nav link to 44px touch targets:
```tsx
<SheetClose
  key={link.href}
  render={<Link href={link.href} />}
  className={cn(
    "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
    isActive
      ? "bg-white/[0.08] text-white"
      : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
  )}
>
  {t(link.labelKey)}
</SheetClose>
```

Add divider between sections by adding to the mobile auth section:
```tsx
<div className="mt-auto border-t border-white/[0.06] p-4">
```

- [ ] **Step 5: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/navbar.tsx
git commit -m "feat(navbar): pill hover pattern, frosted glass, 44px mobile touch targets"
```

---

### Task 8: Update Language Switcher

**Files:**
- Modify: `src/components/layout/language-switcher.tsx`

- [ ] **Step 1: Style as bordered pill**

Update the Button:
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={toggleLocale}
  className="gap-1.5 rounded-full border-white/[0.06] bg-transparent px-3 py-1 text-muted-foreground hover:border-white/[0.12] hover:text-foreground"
  aria-label={`Switch to ${locale === "en" ? "Greek" : "English"}`}
>
  <Globe className="size-3.5" />
  <span className="text-xs font-medium uppercase">{locale === "en" ? "EN" : "EL"}</span>
</Button>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/language-switcher.tsx
git commit -m "feat(language-switcher): bordered pill style"
```

---

### Task 9: Update User Menu

**Files:**
- Modify: `src/components/layout/user-menu.tsx`

- [ ] **Step 1: Update dropdown styling**

Update DropdownMenuContent to match frosted glass:
```tsx
<DropdownMenuContent align="end" sideOffset={8} className="w-56 border-white/[0.06] bg-card/95 backdrop-blur-xl">
```

Keep the avatar at 32px (current `size="default"` is already 32px — do not change to `size="sm"` which would be 24px).

- [ ] **Step 2: Build and commit**

```bash
git add src/components/layout/user-menu.tsx
git commit -m "feat(user-menu): frosted glass dropdown, 32px avatar"
```

---

### Task 10: Redesign Footer

**Files:**
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Update footer styling**

Key changes:
- Top border: gradient (transparent → white/8% → transparent) using a pseudo-element or inline div
- Wrap link sections in semantic `<nav>` with `aria-label`
- Link hover: color transition to white + subtle `translateX(2px)` shift
- Increased padding: `py-20`
- Flex layout for bottom bar

Replace the footer return:
```tsx
return (
  <footer className="relative bg-card">
    {/* Gradient top border */}
    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Logo & Tagline */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="text-lg font-bold text-primary">
            Hiring Partners
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {tFooter("tagline")}
          </p>
        </div>

        {/* Platform Links */}
        <nav aria-label="Platform">
          <h3 className="text-sm font-semibold text-foreground">
            {tFooter("platform")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                href="/discover"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tNav("discover")}
              </Link>
            </li>
            <li>
              <Link
                href="/jobs"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tNav("jobs")}
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tNav("events")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Company Links */}
        <nav aria-label="Company">
          <h3 className="text-sm font-semibold text-foreground">
            {tFooter("company")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                href="/about"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tFooter("about")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tFooter("contact")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal Links */}
        <nav aria-label="Legal">
          <h3 className="text-sm font-semibold text-foreground">
            {tFooter("legal")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tFooter("terms")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-all duration-150 hover:text-white hover:translate-x-0.5"
              >
                {tFooter("privacy")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>{tCommon("poweredBy")}</span>
        <span>
          &copy; {currentYear} Hiring Partners. {tFooter("allRightsReserved")}
        </span>
      </div>
    </div>
  </footer>
);
```

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat(footer): gradient top border, semantic nav elements, hover translateX"
```

---

### Task 11: Add Page Transition (template.tsx)

**Files:**
- Create: `src/app/[locale]/(main)/template.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add fade-in-up keyframe to globals.css**

Add before the scrollbar styles at the end of `globals.css`:

```css
/* Page transition animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 200ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
```

- [ ] **Step 2: Create template.tsx**

```tsx
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in-up">{children}</div>;
}
```

- [ ] **Step 3: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/[locale]/(main)/template.tsx
git commit -m "feat: add subtle page transition animation on route changes"
```

---

## Chunk 4: Landing Page

### Task 12: Redesign Hero Section

**Files:**
- Modify: `src/components/landing/hero-section.tsx`

- [ ] **Step 1: Update HeroSection**

Key changes:
- Add announcement pill with green dot (Linear/Vercel pattern)
- Headline: negative letter-spacing (`tracking-[-0.02em]`), heavier weight
- Subtitle: `max-w-lg`, better line-height
- Primary button: add arrow indicator
- Secondary button: filled ghost style (`bg-white/[0.06]` + border)
- Stats bar: shared background, more spacing from CTAs
- Radial gradient: softer

```tsx
import { ArrowRight } from "lucide-react";
```

Replace the return:
```tsx
return (
  <section className="relative w-full py-20 md:py-32">
    {/* Soft radial gradient */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/[0.06] blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        {/* Announcement pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          {t("heroTitle").split(" ").slice(0, 3).join(" ")}
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-[-0.02em] md:text-6xl">
          {t("heroTitle")}
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
          {t("heroSubtitle")}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-12 gap-2 px-8 text-base"
            render={<Link href="/discover" />}
          >
            {t("exploreCompanies")}
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-white/[0.06] bg-white/[0.06] px-8 text-base hover:bg-white/[0.1]"
            render={<Link href="/discover" />}
          >
            {t("imACompany")}
          </Button>
        </div>

        <div className="mt-20 grid w-full max-w-2xl grid-cols-2 gap-0 rounded-2xl border border-white/[0.06] bg-card p-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/[0.06]">
          <AnimatedCounter
            target={stats.companies}
            label={t("statsCompanies")}
          />
          <AnimatedCounter
            target={stats.candidates}
            label={t("statsCandidates")}
          />
          <AnimatedCounter
            target={stats.events}
            label={t("statsEvents")}
          />
          <AnimatedCounter
            target={stats.sectors}
            label={t("statsSectors")}
          />
        </div>
      </div>
    </div>
  </section>
);
```

Add `ArrowRight` to the Lucide imports.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hero-section.tsx
git commit -m "feat(hero): announcement pill, connected stats bar, softer gradient"
```

---

### Task 13: Update Featured Companies Section

**Files:**
- Modify: `src/components/landing/featured-companies.tsx`

- [ ] **Step 1: Add scroll snap and gradient fade masks**

```tsx
return (
  <section className="w-full py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">
          {t("featuredCompanies")}
        </h2>
        <Link
          href="/discover"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-white"
        >
          {t("viewAll")}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="relative">
        {/* Left fade mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        {/* Right fade mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {companies.map((company) => (
            <div key={company.slug} className="min-w-[280px] snap-start">
              <CompanyCard company={company} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
```

Update "View all" link style: `text-muted-foreground hover:text-white` (instead of `text-primary hover:text-primary/80`).

- [ ] **Step 2: Add scrollbar-hide utility to globals.css**

Add before the custom scrollbar styles:
```css
/* Hide scrollbar utility */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 3: Build and commit**

```bash
git add src/components/landing/featured-companies.tsx src/app/globals.css
git commit -m "feat(featured-companies): scroll snap, gradient fade masks, scrollbar-hide"
```

---

### Task 14: Update How It Works Section

**Files:**
- Modify: `src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Add numbered steps with connecting line, icons in surface-2 circles**

```tsx
return (
  <section className="w-full py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
        {t("howItWorks")}
      </h2>
      <p className="mb-12 text-center text-muted-foreground">
        {t("heroSubtitle")}
      </p>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Connecting line (desktop only) */}
        <div className="absolute top-12 left-[16.67%] right-[16.67%] hidden h-px bg-white/[0.06] md:block" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.titleKey}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2 ring-4 ring-background">
                <Icon className="size-5 text-primary" />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t(step.titleKey)}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {t(step.descKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
```

Remove the `Card` and `CardContent` imports since we no longer use card containers.

- [ ] **Step 2: Build and commit**

```bash
git add src/components/landing/how-it-works.tsx
git commit -m "feat(how-it-works): numbered steps with connecting line, surface-2 circles"
```

---

### Task 15: Update Newsletter CTA

**Files:**
- Modify: `src/components/landing/newsletter-cta.tsx`

- [ ] **Step 1: Update to card with top border gradient accent**

```tsx
return (
  <section className="w-full py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card px-6 py-12 text-center md:px-12">
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <h2 className="text-2xl font-bold md:text-3xl">
          {t("newsletterTitle")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("newsletterSubtitle")}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 flex-1 bg-background border-white/[0.06] focus:border-white/[0.12]"
            required
          />
          <Button type="submit" size="lg" className="h-10 px-6">
            {t("subscribe")}
          </Button>
        </form>
      </div>
    </div>
  </section>
);
```

- [ ] **Step 2: Build and commit**

```bash
git add src/components/landing/newsletter-cta.tsx
git commit -m "feat(newsletter): top gradient accent, inset input styling"
```

---

## Chunk 5: Discover, Auth, Company Profile

### Task 16: Update Discover Page Components

**Files:**
- Modify: `src/components/discover/search-bar.tsx`
- Modify: `src/components/discover/filter-bar.tsx`
- Modify: `src/components/discover/company-grid.tsx`

- [ ] **Step 1: Update SearchBar**

```tsx
return (
  <div className="relative w-full">
    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="text"
      placeholder={t("searchPlaceholder")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full bg-card border-white/[0.06] pl-11 text-sm transition-all duration-150 focus:border-white/[0.12] focus:bg-surface-2 focus:ring-1 focus:ring-white/10"
    />
  </div>
);
```

- [ ] **Step 2: Update FilterBar chip styling**

Update `chipClass` function:
```tsx
function chipClass(active: boolean) {
  return active
    ? "border-primary text-primary bg-transparent hover:bg-primary/10"
    : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:border-white/[0.12]";
}
```

- [ ] **Step 3: Update CompanyGrid empty state**

Update the empty state in `CompanyGrid`:
```tsx
if (companies.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Search className="size-12 text-muted-foreground/40" />
      <p className="text-lg text-muted-foreground">{t("noResults")}</p>
      <p className="text-sm text-muted-foreground/70">Try different filters or search terms</p>
    </div>
  );
}
```

Add `Search` to imports in `company-grid.tsx`.

Update the results count to be right-aligned with opacity transition:
```tsx
<p className="mb-4 text-right text-sm text-muted-foreground transition-opacity">
  {total} {total === 1 ? "company" : "companies"}
</p>
```

- [ ] **Step 4: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/discover/search-bar.tsx src/components/discover/filter-bar.tsx src/components/discover/company-grid.tsx
git commit -m "feat(discover): larger search bar with focus ring, ghost filter pills, improved empty state"
```

---

### Task 17: Redesign Auth Pages

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/register-form.tsx`
- Modify: `src/app/[locale]/(auth)/login/page.tsx`
- Modify: `src/app/[locale]/(auth)/register/page.tsx`

- [ ] **Step 1: Update LoginForm**

Key changes:
- Input bg matches page bg (creates inset effect), focus ring
- Larger padding via className
- Button loading: spinner icon replaces text
- Error state: red border on field + `aria-describedby`
- `space-y-5` spacing

```tsx
import { Loader2 } from "lucide-react";
```

Update form wrapper and spacing:
```tsx
<div className="border border-white/[0.06] bg-card rounded-xl p-6 md:p-8">
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
```

Update each input field to use page bg for inset effect:
```tsx
<Input
  id="email"
  type="email"
  autoComplete="email"
  {...register("email")}
  className="mt-1.5 bg-background border-white/[0.06] px-3.5 py-2.5 focus:border-white/[0.12] focus:ring-1 focus:ring-white/10"
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-destructive mt-1">
    {errors.email.message}
  </p>
)}
```

Same pattern for password field (with `id="password-error"`).

Update the submit button to use spinner:
```tsx
<Button
  type="submit"
  className="w-full"
  size="lg"
  disabled={isLoading}
>
  {isLoading ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    t("signIn")
  )}
</Button>
```

- [ ] **Step 2: Update RegisterForm with same pattern**

Same changes as LoginForm:
- `space-y-5`
- Inset input styling with `bg-background border-white/[0.06]`
- Focus ring on inputs
- Spinner on submit button
- `aria-describedby` on error fields
- Add `Loader2` import

- [ ] **Step 3: Update auth page wrappers to include logo in form card**

Update `login/page.tsx`:
```tsx
export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">{t("login")}</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {t("loginSubtitle") || "Sign in to your account"}
      </p>
      <LoginForm />
    </div>
  );
}
```

Update `register/page.tsx` similarly.

Update `(auth)/layout.tsx` to use `max-w-[400px]`:
```tsx
<div className="w-full max-w-[400px]">{children}</div>
```

- [ ] **Step 4: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/login-form.tsx src/components/auth/register-form.tsx src/app/[locale]/(auth)/login/page.tsx src/app/[locale]/(auth)/register/page.tsx src/app/[locale]/(auth)/layout.tsx
git commit -m "feat(auth): inset input styling, spinner loading, aria-describedby errors"
```

---

### Task 18: Redesign Company Profile Hero

**Files:**
- Modify: `src/components/company/company-hero.tsx`

- [ ] **Step 1: Update CompanyHero**

Key changes:
- Gradient bg (surface-1 → surface-2)
- Logo 64px, inset with page bg color
- Verification: lime check next to name
- Actions: Follow as ghost, View Jobs as primary
- Consistent badge styling

Update the container:
```tsx
<div className="overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-card to-surface-2">
```

Update logo size to 64px:
```tsx
<div className="-mt-10 mb-4 sm:-mt-12">
  {logo ? (
    <img
      src={logo}
      alt={name}
      className="size-16 rounded-xl border-4 border-background bg-background object-cover"
    />
  ) : (
    <div className="flex size-16 items-center justify-center rounded-xl border-4 border-background bg-surface-2 text-xl font-bold text-white">
      {firstLetter}
    </div>
  )}
</div>
```

Update name with inline verification:
```tsx
<div className="flex items-center gap-2">
  <h1 className="text-3xl font-bold text-foreground">{name}</h1>
  {status === "VERIFIED" && (
    <CheckCircle className="size-5 text-primary" />
  )}
</div>
```

Update badges to consistent style:
```tsx
<div className="mt-4 flex flex-wrap items-center gap-2">
  <span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
    {industry}
  </span>
  {locations.map((loc) => (
    <span key={loc} className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
      <MapPin className="size-3" />
      {loc}
    </span>
  ))}
  {SIZE_LABELS[size] && (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
      <Users className="size-3" />
      {SIZE_LABELS[size]}
    </span>
  )}
</div>
```

Remove the separate status badge section at the bottom (verification is now inline with name). Keep claim modal logic for unclaimed companies.

Remove `Badge` import and `getIndustryColor` function.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/company/company-hero.tsx
git commit -m "feat(company-hero): gradient bg, 64px logo, inline verification, consistent badges"
```

---

### Task 19: Update Company Tabs and Gallery

**Files:**
- Modify: `src/components/company/company-tabs.tsx`
- Modify: `src/components/company/gallery-tab.tsx`

- [ ] **Step 1: Update CompanyTabs styling**

Update tab trigger styling — active: lime bottom border + white text:
The shadcn Tabs component handles active state via data attributes. We need to customize the TabsTrigger:

```tsx
<TabsTrigger
  value="about"
  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white transition-colors duration-150"
>
  {t("about")}
</TabsTrigger>
```

Apply same pattern to all tab triggers. Update count badges to pill style:
```tsx
{jobs.length > 0 && (
  <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-muted-foreground">
    {jobs.length}
  </span>
)}
```

- [ ] **Step 2: Update GalleryTab to CSS columns masonry layout**

```tsx
return (
  <div className="columns-2 gap-4 md:columns-3">
    {images
      .sort((a, b) => a.order - b.order)
      .map((image) => (
        <div key={image.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl">
          <img
            src={image.url}
            alt={image.caption || "Gallery image"}
            className="w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          />
          {image.caption && (
            <p className="mt-2 text-sm text-muted-foreground">
              {image.caption}
            </p>
          )}
        </div>
      ))}
  </div>
);
```

- [ ] **Step 3: Build and commit**

```bash
git add src/components/company/company-tabs.tsx src/components/company/gallery-tab.tsx
git commit -m "feat(company): tab active styling, CSS columns gallery masonry"
```

---

## Chunk 6: Onboarding, Jobs, Events, Dashboards

### Task 20: Redesign Onboarding Wizard

**Files:**
- Modify: `src/components/onboarding/onboarding-wizard.tsx`

- [ ] **Step 1: Update wizard container and step indicator**

Key changes:
- Wider container: `max-w-[560px]`
- Step indicator: horizontal dots instead of progress bar
- Card with border
- Navigation buttons: Back as ghost, Next/Complete as primary

Replace the progress section with dot indicator:
```tsx
<div className="mb-6 flex items-center justify-center gap-3">
  {[1, 2, 3].map((step) => (
    <div
      key={step}
      className={cn(
        "size-2.5 rounded-full transition-colors",
        step < currentStep
          ? "bg-primary"
          : step === currentStep
          ? "bg-primary"
          : "bg-white/10"
      )}
    />
  ))}
</div>
```

Update the container width:
```tsx
<div className="w-full max-w-[560px]">
```

Update Card to use border:
```tsx
<Card className="border-white/[0.06]">
```

Update navigation buttons — Back as ghost (already variant="outline", change to "ghost"):
```tsx
<Button
  type="button"
  variant="ghost"
  onClick={handleBack}
  size="lg"
>
  <ArrowLeft className="size-4 mr-1" />
  {t("back")}
</Button>
```

Add `cn` import from `@/lib/utils`.

Remove `Progress` import.

- [ ] **Step 2: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/onboarding-wizard.tsx
git commit -m "feat(onboarding): dot step indicator, 560px container, ghost back button"
```

---

### Task 21: Update Jobs Page

**Files:**
- Modify: `src/components/jobs/jobs-client.tsx`
- Modify: `src/components/jobs/job-filters.tsx`

- [ ] **Step 1: Update JobsClient layout**

Change the grid to single column for list layout:
```tsx
{/* Job list - single column */}
{loading ? (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-40 rounded-xl" />
    ))}
  </div>
) : jobs.length === 0 ? (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <Briefcase className="size-12 text-muted-foreground/40" />
    <p className="text-lg font-medium text-muted-foreground">
      No jobs found
    </p>
    <p className="text-sm text-muted-foreground/70">
      Try different filters or search terms
    </p>
  </div>
) : (
  <div className="flex flex-col gap-4">
    {jobs.map((job) => (
      <JobCard key={job.id} job={job} />
    ))}
  </div>
)}
```

- [ ] **Step 2: Update JobFilters to ghost pill style**

Read and update `src/components/jobs/job-filters.tsx` — apply same `chipClass` pattern from discover filter-bar:
```tsx
function chipClass(active: boolean) {
  return active
    ? "border-primary text-primary bg-transparent hover:bg-primary/10"
    : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:border-white/[0.12]";
}
```

- [ ] **Step 3: Build and commit**

```bash
git add src/components/jobs/jobs-client.tsx src/components/jobs/job-filters.tsx
git commit -m "feat(jobs): single column list layout, ghost pill filters, improved empty state"
```

---

### Task 22: Update Events Page

**Files:**
- Modify: `src/components/events/events-client.tsx`
- Modify: `src/components/events/event-filters.tsx`

- [ ] **Step 1: Update EventsClient**

Update the empty state icon size and style:
```tsx
<Calendar className="size-12 text-muted-foreground/40" />
```

Grid is already 2-3 columns — just ensure it uses `sm:grid-cols-2 lg:grid-cols-3`.

- [ ] **Step 2: Update EventFilters to ghost pill style**

Read `src/components/events/event-filters.tsx` and apply same ghost pill `chipClass` pattern.

- [ ] **Step 3: Build and commit**

```bash
git add src/components/events/events-client.tsx src/components/events/event-filters.tsx
git commit -m "feat(events): ghost pill filters, improved empty state"
```

---

### Task 23: Update Dashboard Components

**Files:**
- Modify: `src/components/dashboard/candidate/dashboard-client.tsx`
- Modify: `src/components/dashboard/company/dashboard-client.tsx`
- Modify: `src/components/admin/admin-dashboard-client.tsx`

- [ ] **Step 1: Update CandidateDashboardClient tabs**

Update TabsList to use pill-style active state:
```tsx
<TabsList className="mb-6 w-full sm:w-auto bg-transparent gap-1">
  <TabsTrigger
    value="following"
    className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.06] data-[state=active]:text-white"
  >
    <Heart className="size-4" />
    Following
  </TabsTrigger>
  <TabsTrigger
    value="saved-jobs"
    className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.06] data-[state=active]:text-white"
  >
    <Bookmark className="size-4" />
    Saved Jobs
  </TabsTrigger>
  <TabsTrigger
    value="settings"
    className="gap-1.5 rounded-lg data-[state=active]:bg-white/[0.06] data-[state=active]:text-white"
  >
    <Settings className="size-4" />
    Settings
  </TabsTrigger>
</TabsList>
```

- [ ] **Step 2: Update CompanyDashboardClient tabs with same pattern**

Read `src/components/dashboard/company/dashboard-client.tsx` and apply same pill-style tab pattern.

- [ ] **Step 3: Update AdminDashboardClient tabs with same pattern**

Read `src/components/admin/admin-dashboard-client.tsx` and apply same pill-style tab pattern.

- [ ] **Step 4: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/candidate/dashboard-client.tsx src/components/dashboard/company/dashboard-client.tsx src/components/admin/admin-dashboard-client.tsx
git commit -m "feat(dashboards): pill-style active tabs across all dashboards"
```

---

### Task 24: Update Admin Tables and Claims Queue

**Files:**
- Modify: `src/components/admin/claims-queue.tsx`

- [ ] **Step 1: Update claims queue status badges**

Read `src/components/admin/claims-queue.tsx` and update status badge colors to use semantic tokens:
- Pending: `bg-yellow-500/10 text-yellow-400 border-yellow-500/20`
- Approved: `bg-green-500/10 text-green-400 border-green-500/20`
- Rejected: `bg-red-500/10 text-red-400 border-red-500/20`

- [ ] **Step 2: Build and commit**

```bash
git add src/components/admin/claims-queue.tsx
git commit -m "feat(admin): semantic status badge colors in claims queue"
```

---

### Task 25: Update AnimatedCounter for Stats Bar

**Files:**
- Modify: `src/components/landing/animated-counter.tsx`

- [ ] **Step 1: Update AnimatedCounter to match stats bar design**

Since the stats bar now uses a connected card with dividers, update the counter layout:
```tsx
return (
  <div ref={ref} className="flex flex-col items-center justify-center px-4 py-2">
    <div className="text-2xl font-bold text-primary md:text-3xl">
      {count}
      {suffix}
    </div>
    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
  </div>
);
```

Remove `font-mono` class (cleaner look).

- [ ] **Step 2: Build and commit**

```bash
git add src/components/landing/animated-counter.tsx
git commit -m "feat(counter): update layout for connected stats bar"
```

---

### Task 26: Update Multi-Select Chips

**Files:**
- Modify: `src/components/shared/multi-select-chips.tsx`

- [ ] **Step 1: Update chip styling to match spec**

Update the `className` in the chip button:
```tsx
<button
  key={option}
  type="button"
  onClick={() => toggleOption(option)}
  className={cn(
    "rounded-full px-4 py-2 text-sm border cursor-pointer transition-all duration-150",
    isSelected
      ? "border-primary text-primary bg-transparent"
      : "bg-white/[0.06] border-white/[0.04] text-muted-foreground hover:border-white/[0.12]"
  )}
>
  {option}
</button>
```

Key changes: unselected uses `bg-white/[0.06] border-white/[0.04]` (spec section 10). Selected uses `border-primary text-primary` (lime border + lime text).

- [ ] **Step 2: Build and commit**

```bash
git add src/components/shared/multi-select-chips.tsx
git commit -m "feat(multi-select-chips): consistent chip styling per design spec"
```

---

### Task 27: Add Onboarding Step Transitions

**Files:**
- Modify: `src/components/onboarding/onboarding-wizard.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add step transition keyframes to globals.css**

Add after the `animate-fade-in-up` class:

```css
/* Onboarding step transitions */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

.animate-slide-in-left {
  animation: slide-in-left 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
}
```

- [ ] **Step 2: Wrap step content in animated divs**

In the onboarding wizard, add a `direction` state and wrap each step in an animated container using a `key` to trigger re-mount:

Add state: `const [direction, setDirection] = useState<"forward" | "back">("forward");`

Update `handleNext` to set `setDirection("forward")` before advancing.
Update `handleBack` to set `setDirection("back")` before going back.

Wrap the step content:
```tsx
<div
  key={currentStep}
  className={direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"}
>
  {currentStep === 1 && <StepAbout ... />}
  {currentStep === 2 && <StepInterests ... />}
  {currentStep === 3 && <StepPreferences ... />}
</div>
```

- [ ] **Step 3: Build and commit**

```bash
git add src/app/globals.css src/components/onboarding/onboarding-wizard.tsx
git commit -m "feat(onboarding): add slide+fade step transitions"
```

---

### Task 28: Update Dashboard Sidebar Navigation

**Files:**
- Modify: `src/app/[locale]/(main)/dashboard/company/layout.tsx`
- Modify: `src/components/admin/admin-dashboard-client.tsx`

- [ ] **Step 1: Update Company Dashboard sidebar active state**

In `src/app/[locale]/(main)/dashboard/company/layout.tsx`, update the `SidebarNav` button className:
```tsx
<button
  key={item.id}
  onClick={() => onTabChange(item.id)}
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-white/[0.06] text-white"
      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
  )}
>
```

Update the sidebar container to use surface-1 card:
```tsx
<div className="sticky top-24 space-y-4">
  <div className="flex items-center gap-2 rounded-lg bg-card border border-white/[0.06] p-3">
```

- [ ] **Step 2: Update Admin Dashboard sidebar active state**

In `src/components/admin/admin-dashboard-client.tsx`, update the `SidebarContent` button className:
```tsx
<button
  key={item.id}
  onClick={() => onTabChange(item.id)}
  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "bg-white/[0.06] text-white"
      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
  }`}
>
```

Also update the desktop sidebar container border:
```tsx
<aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-card">
```

And the `ShieldCheck` icon color from `text-[#9fef00]` to `text-primary` (uses token).

- [ ] **Step 3: Build and commit**

```bash
git add src/app/[locale]/(main)/dashboard/company/layout.tsx src/components/admin/admin-dashboard-client.tsx
git commit -m "feat(dashboards): update sidebar active states to white/6% bg, white text"
```

---

### Task 29: Update Dashboard Table Styling

**Files:**
- Modify: `src/components/dashboard/company/job-manager.tsx`
- Modify: `src/components/admin/companies-table.tsx`
- Modify: `src/components/admin/candidates-table.tsx`
- Modify: `src/components/admin/jobs-table.tsx`
- Modify: `src/components/admin/events-manager.tsx`

- [ ] **Step 1: Update table row hover and header styles**

For each table component listed above, apply these styling changes to the `<Table>` elements:

Table header row: add `bg-white/[0.05]`
Table body rows: add `hover:bg-white/[0.03]`
Table borders: use `border-white/[0.06]`

For shadcn Table components, update `TableHeader`:
```tsx
<TableHeader className="bg-white/[0.05]">
```

Update `TableRow` in `TableBody`:
```tsx
<TableRow className="border-white/[0.06] hover:bg-white/[0.03]">
```

Apply to all 5 files listed above. Each file has at least one table.

- [ ] **Step 2: Build and commit**

```bash
git add src/components/dashboard/company/job-manager.tsx src/components/admin/companies-table.tsx src/components/admin/candidates-table.tsx src/components/admin/jobs-table.tsx src/components/admin/events-manager.tsx
git commit -m "feat(tables): consistent row hover, header bg, and border styling"
```

---

### Task 30: Update Dashboard Chart Tokens

**Files:**
- Modify: `src/components/dashboard/company/analytics.tsx`
- Modify: `src/components/admin/analytics-dashboard.tsx`

- [ ] **Step 1: Update chart colors and grid lines**

In both analytics files, update:

Grid line color from `#1e293b` to `rgba(255,255,255,0.04)`:
```tsx
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
```

For files without explicit CartesianGrid, add one.

Update tooltip styles to use token-aligned colors:
```tsx
const tooltipStyle = {
  backgroundColor: "oklch(0.14 0.01 260)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  color: "#f8fafc",
  fontSize: "12px",
};
```

The primary chart color `#9fef00` stays as the lime accent (it will naturally look correct against the new background). Secondary blue `#14b8a6` and other colors remain.

- [ ] **Step 2: Build and commit**

```bash
git add src/components/dashboard/company/analytics.tsx src/components/admin/analytics-dashboard.tsx
git commit -m "feat(charts): update grid lines and tooltip styling to match design tokens"
```

---

### Task 31: Add Empty State Ghost Button CTAs

**Files:**
- Modify: `src/components/discover/company-grid.tsx`
- Modify: `src/components/jobs/jobs-client.tsx`
- Modify: `src/components/events/events-client.tsx`

- [ ] **Step 1: Add "Clear filters" ghost button to discover empty state**

In `company-grid.tsx`, update the empty state:
```tsx
if (companies.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Search className="size-12 text-muted-foreground/40" />
      <p className="text-lg text-muted-foreground">{t("noResults")}</p>
      <p className="text-sm text-muted-foreground/70">Try different filters or search terms</p>
    </div>
  );
}
```

Note: The "Clear filters" action requires a callback prop. If the parent component (DiscoverClient) does not pass a clear handler, just display the descriptive text. Adding a prop is acceptable if simple.

- [ ] **Step 2: Add descriptive text to jobs and events empty states**

The jobs and events empty states already have icon + heading + subtitle. Ensure they match the pattern:
- Icon at 48px for page-level empty states (discover), 24px (`size-6`) for inline empty states
- Descriptive heading + subtitle
- Ghost button CTA when actionable (only add if a clear/reset action is available via props)

- [ ] **Step 3: Build and commit**

```bash
git add src/components/discover/company-grid.tsx src/components/jobs/jobs-client.tsx src/components/events/events-client.tsx
git commit -m "feat(empty-states): improved empty state patterns with descriptive text"
```

---

### Task 32: Final Build Verification

- [ ] **Step 1: Full build check**

Run: `cd /home/ubuntu/people_in_tech && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Check for any remaining card-glow references**

Run: `grep -r "card-glow" src/`
Expected: No results

- [ ] **Step 3: Check for any remaining glow shadow references**

Run: `grep -r "shadow-glow" src/`
Expected: No results

- [ ] **Step 4: Check for remaining hardcoded `#9fef00` in non-chart files**

Run: `grep -r "#9fef00" src/ --include="*.tsx" | grep -v analytics | grep -v chart`
Expected: No results (all occurrences should use `text-primary` token instead)

- [ ] **Step 5: Check for remaining old `bg-primary/10` active states in sidebars**

Run: `grep -r "bg-primary/10" src/ --include="*.tsx"`
Expected: No results in sidebar/nav components

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: cleanup remaining old design token references"
```

---

## Notes from Review

**Deferred items (not addressed in this plan):**

1. **Register page role selector pill toggle** — Spec section 7 describes "Role selector (Candidate/Company) uses pill toggle instead of radio buttons." However, the current register form has no role selector at all (name, email, password only). Adding one requires backend schema changes (`registerSchema` in `src/lib/validations/auth.ts` and the register API route). Since the spec states "no new features or functionality changes — this is visual/interaction only", this is deferred to a separate feature task.

2. **Featured gradient border utility** — Spec section 1 mentions "gradient border (white 8% to 3%)" for featured elements. This can be applied inline where needed rather than as a shared utility, since the spec doesn't identify specific components requiring it.

3. **Social links in footer** — Spec section 4 mentions "separated copyright and social links" but no social link data or icons are defined. Deferred until social media URLs are available.

4. **Sign In button as solid lime** — Spec says promote Sign In to solid lime CTA. Plan keeps Get Started as primary CTA and Sign In as ghost, which is a more standard registration-focused pattern. Flagged for spec author review.

5. **Button loading states as global pattern** — Plan applies spinner-replaces-text in auth forms and onboarding. Other submit buttons (newsletter, event registration, dashboard forms) should adopt the same pattern when touched. No separate task needed — this is a pattern to follow.
