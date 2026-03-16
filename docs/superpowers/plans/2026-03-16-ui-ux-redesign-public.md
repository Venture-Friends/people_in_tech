# UI/UX Redesign (Public Pages) — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all public-facing pages with the new visual identity (animated dark theme, Space Grotesk + Inter, morphing orbs, perspective grid, particles) while preserving all existing functionality.

**Architecture:** Token-first approach — update CSS custom properties and fonts in `globals.css` and `layout.tsx`, build shared `AnimatedBackground` component, then cascade the new design across navbar, footer, homepage, and all browse/detail pages. All changes are visual/interaction — no functionality changes except adding the job detail page route.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (CSS-based config), shadcn/ui v4 (base-nova), Lucide icons, next-intl, Space Grotesk + Inter fonts

**Spec:** `docs/superpowers/specs/2026-03-16-ui-ux-redesign-design.md`

**Branch:** `feat/ui-ux-redesign-v2`

---

## Important Notes for Implementers

1. **Primary color:** The animated background CSS uses `oklch(0.88 0.27 128)` — the brighter neon green. The current codebase `--primary` is `oklch(0.82 0.19 130)` (desaturated). Task 1 updates `--primary` to match. If the client prefers the desaturated version, replace all `oklch(0.88 0.27 128)` references with `oklch(0.82 0.19 130)`.
2. **Font variables** are on `<body>`, not `<html>`, in `src/app/layout.tsx`. Apply `spaceGrotesk.variable` there.
3. **CompanyCardData interface** needs `founded?: number`, `technologies?: string`, `size?: string` added as optional fields. Update data fetchers to include these. Existing consumers won't break since fields are optional.
4. **Job detail page** only uses existing `JobListing` fields for MVP. Schema migration for `description`/`requirements`/`techStack` is deferred to Plan B (user-flows). The detail page gracefully shows whatever data exists.
5. **Shared components** (Task 21: SectionHeader, PageHeader, Divider) should be created EARLY and used by subsequent page tasks. The plan orders them last for commit clarity, but the implementing agent should create them when first needed and reference them throughout.
6. **Ticker data:** The homepage `getStats()` function needs updating to also return `industries: string[]` (distinct from Company table) and `techAndLocations: string[]` (distinct technologies + locations aggregated from all companies).
7. **Homepage "Latest Jobs" section:** The spec requires this but the current homepage doesn't have one. Add it between Featured Companies and Upcoming Events, reusing the JobCard component with a `getLatestJobs()` server function.

---

## Chunk 1: Design Tokens & Fonts

### Task 1: Update Color Tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `:root` and `.dark` background color**

Change `--background` from `oklch(0.11 0.01 260)` to `oklch(0.07 0.01 260)` (deeper, near-black `#06080c`) in both `:root` and `.dark` blocks.

Also update `--primary` from `oklch(0.82 0.19 130)` to `oklch(0.88 0.27 128)` (brighter neon green to match mockups). Update all tokens that reference primary: `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`.

- [ ] **Step 2: Update card and surface tokens**

In both `:root` and `.dark`:
```css
--card: oklch(0.10 0.01 260);            /* was oklch(0.14 0.01 260) — darker card bg */
--surface-2: oklch(0.13 0.01 260);       /* was oklch(0.17 0.01 260) */
--surface-3: oklch(0.17 0.01 260);       /* was oklch(0.21 0.01 260) */
--popover: oklch(0.10 0.01 260);         /* match card */
--sidebar: oklch(0.10 0.01 260);         /* match card */
--primary-foreground: oklch(0.07 0.01 260); /* match new bg */
```

- [ ] **Step 3: Update border base style**

In the `@layer base` block, update the border opacity for the deeper background:
```css
@layer base {
  * {
    @apply border-white/[0.05] outline-ring/50;
  }
}
```

- [ ] **Step 4: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(tokens): deepen background to #06080c, update surface hierarchy"
```

---

### Task 2: Add Space Grotesk Font

**Files:**
- Modify: `src/lib/fonts.ts` (or wherever fonts are loaded — check for `next/font/google` imports)
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Find font loading file**

Run: `grep -r "next/font" src/ --include="*.ts" --include="*.tsx" -l`
The font loading is likely in `src/lib/fonts.ts` or directly in `src/app/layout.tsx`.

- [ ] **Step 2: Add Space Grotesk font import**

In the font loading file, add:
```typescript
import { Space_Grotesk } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});
```

- [ ] **Step 3: Apply font variable to html element**

In `src/app/layout.tsx`, add `spaceGrotesk.variable` to the className on the `<html>` element alongside the existing font variables.

- [ ] **Step 4: Register font-display in globals.css @theme inline**

Add to the `@theme inline` block:
```css
--font-display: var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 5: Remove JetBrains Mono (if not used elsewhere)**

Search for JetBrains Mono usage: `grep -r "jetbrains\|font-mono\|JetBrains" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l`

If only used in globals.css font registration and a few components for stats, remove the import and replace `font-mono` references with `font-display` (Space Grotesk).

- [ ] **Step 6: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/lib/fonts.ts src/app/layout.tsx src/app/globals.css
git commit -m "feat(fonts): add Space Grotesk as display font, replace JetBrains Mono"
```

---

## Chunk 2: Animated Background Component

### Task 3: Create AnimatedBackground Component

**Files:**
- Create: `src/components/shared/animated-background.tsx`

- [ ] **Step 1: Create the component file**

Create `src/components/shared/animated-background.tsx` as a Client Component. This renders 6 morphing gradient orbs, a perspective grid with horizon glow, 24 floating particles, and a noise texture overlay. All CSS-only animations.

```tsx
"use client";

export function AnimatedBackground() {
  return (
    <>
      {/* Gradient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
      </div>

      {/* Perspective Grid */}
      <div className="perspective-grid" aria-hidden="true" />

      {/* Noise Texture */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Floating Particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add animated background CSS to globals.css**

Add the following CSS at the end of `src/app/globals.css` (before any `@layer` blocks or after all of them):

```css
/* ========================================
   ANIMATED BACKGROUND
   ======================================== */

/* Orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.orb-1 {
  width: 1000px; height: 1000px;
  top: -15%; left: 25%;
  background: radial-gradient(circle, oklch(0.88 0.27 128 / 0.18) 0%, oklch(0.88 0.27 128 / 0.06) 35%, transparent 65%);
  animation: orb-drift-1 18s ease-in-out infinite;
}
.orb-2 {
  width: 800px; height: 800px;
  top: 5%; right: -8%;
  background: radial-gradient(circle, oklch(0.58 0.18 255 / 0.12) 0%, transparent 65%);
  animation: orb-drift-2 22s ease-in-out infinite;
}
.orb-3 {
  width: 600px; height: 600px;
  bottom: 25%; left: -5%;
  background: radial-gradient(circle, oklch(0.88 0.27 128 / 0.10) 0%, transparent 55%);
  animation: orb-drift-3 15s ease-in-out infinite;
}
.orb-4 {
  width: 700px; height: 700px;
  top: 35%; left: 55%;
  background: radial-gradient(circle, oklch(0.48 0.2 290 / 0.08) 0%, transparent 55%);
  animation: orb-drift-4 20s ease-in-out infinite;
}
.orb-5 {
  width: 900px; height: 900px;
  bottom: -5%; right: 15%;
  background: radial-gradient(circle, oklch(0.88 0.27 128 / 0.12) 0%, oklch(0.88 0.27 128 / 0.04) 35%, transparent 60%);
  animation: orb-drift-5 25s ease-in-out infinite;
}
.orb-6 {
  width: 500px; height: 500px;
  top: 60%; left: 10%;
  background: radial-gradient(circle, oklch(0.58 0.18 255 / 0.07) 0%, transparent 50%);
  animation: orb-drift-3 17s ease-in-out infinite reverse;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(4%, -3%) scale(1.05); }
  50% { transform: translate(-2%, 4%) scale(0.95); }
  75% { transform: translate(3%, 1%) scale(1.02); }
}
@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-5%, 3%) scale(1.08); }
  66% { transform: translate(3%, -4%) scale(0.92); }
}
@keyframes orb-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6%, -3%) scale(1.1); }
}
@keyframes orb-drift-4 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(-3%, 5%) scale(1.05) rotate(3deg); }
  66% { transform: translate(4%, -2%) scale(0.96) rotate(-2deg); }
}
@keyframes orb-drift-5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40% { transform: translate(-4%, -3%) scale(1.06); }
  70% { transform: translate(2%, 4%) scale(0.95); }
}

/* Perspective Grid */
.perspective-grid {
  position: fixed;
  top: 8%;
  left: 50%;
  transform: translateX(-50%) perspective(500px) rotateX(60deg);
  width: 1800px;
  height: 1100px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
  mask-image: radial-gradient(ellipse 55% 55% at 50% 25%, black, transparent);
}
.perspective-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(oklch(0.88 0.27 128 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, oklch(0.88 0.27 128 / 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-pulse 6s ease-in-out infinite;
}
.perspective-grid::after {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(90deg, transparent, oklch(0.88 0.27 128 / 0.4), transparent);
  filter: blur(2px);
  animation: horizon-glow 4s ease-in-out infinite;
}

@keyframes grid-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes horizon-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }

/* Noise Overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* Particles */
.particle {
  position: absolute;
  border-radius: 50%;
  background: oklch(0.88 0.27 128 / 0.4);
  animation: particle-float linear infinite;
}

/* Generate 24 particles with varied positions, sizes, colors, speeds */
.particle-1  { left: 3%;  width: 3px; height: 3px; animation-duration: 14s; }
.particle-2  { left: 8%;  width: 2px; height: 2px; animation-duration: 18s; animation-delay: -2s; background: oklch(0.58 0.18 255 / 0.4); }
.particle-3  { left: 14%; width: 4px; height: 4px; animation-duration: 16s; animation-delay: -5s; background: oklch(0.88 0.27 128 / 0.25); }
.particle-4  { left: 19%; width: 2px; height: 2px; animation-duration: 20s; animation-delay: -1s; }
.particle-5  { left: 25%; width: 3px; height: 3px; animation-duration: 15s; animation-delay: -7s; background: oklch(0.48 0.2 290 / 0.35); }
.particle-6  { left: 30%; width: 2px; height: 2px; animation-duration: 22s; animation-delay: -3s; }
.particle-7  { left: 35%; width: 3px; height: 3px; animation-duration: 17s; animation-delay: -9s; background: oklch(0.58 0.18 255 / 0.3); }
.particle-8  { left: 40%; width: 2px; height: 2px; animation-duration: 19s; animation-delay: -4s; }
.particle-9  { left: 45%; width: 4px; height: 4px; animation-duration: 14s; animation-delay: -11s; background: oklch(0.88 0.27 128 / 0.2); }
.particle-10 { left: 50%; width: 2px; height: 2px; animation-duration: 21s; animation-delay: -6s; }
.particle-11 { left: 55%; width: 3px; height: 3px; animation-duration: 16s; animation-delay: -8s; background: oklch(0.48 0.2 290 / 0.3); }
.particle-12 { left: 60%; width: 2px; height: 2px; animation-duration: 23s; animation-delay: -2s; }
.particle-13 { left: 65%; width: 3px; height: 3px; animation-duration: 15s; animation-delay: -10s; }
.particle-14 { left: 70%; width: 2px; height: 2px; animation-duration: 18s; animation-delay: -5s; background: oklch(0.58 0.18 255 / 0.35); }
.particle-15 { left: 75%; width: 4px; height: 4px; animation-duration: 20s; animation-delay: -1s; background: oklch(0.88 0.27 128 / 0.2); }
.particle-16 { left: 80%; width: 2px; height: 2px; animation-duration: 17s; animation-delay: -7s; }
.particle-17 { left: 85%; width: 3px; height: 3px; animation-duration: 22s; animation-delay: -3s; background: oklch(0.48 0.2 290 / 0.25); }
.particle-18 { left: 90%; width: 2px; height: 2px; animation-duration: 16s; animation-delay: -9s; }
.particle-19 { left: 95%; width: 3px; height: 3px; animation-duration: 19s; animation-delay: -4s; }
.particle-20 { left: 12%; width: 2px; height: 2px; animation-duration: 21s; animation-delay: -12s; background: oklch(0.58 0.18 255 / 0.3); }
.particle-21 { left: 27%; width: 3px; height: 3px; animation-duration: 14s; animation-delay: -6s; }
.particle-22 { left: 42%; width: 2px; height: 2px; animation-duration: 18s; animation-delay: -8s; background: oklch(0.88 0.27 128 / 0.35); }
.particle-23 { left: 57%; width: 3px; height: 3px; animation-duration: 20s; animation-delay: -13s; background: oklch(0.48 0.2 290 / 0.3); }
.particle-24 { left: 72%; width: 2px; height: 2px; animation-duration: 15s; animation-delay: -10s; }

@keyframes particle-float {
  0% { transform: translateY(100vh) translateX(0); opacity: 0; }
  6% { opacity: 1; }
  88% { opacity: 0.8; }
  100% { transform: translateY(-10vh) translateX(40px); opacity: 0; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .orb, .particle, .perspective-grid::before, .perspective-grid::after {
    animation: none !important;
  }
  .perspective-grid { opacity: 0.3; }
}

/* Mobile: fewer particles, hide grid */
@media (max-width: 767px) {
  .perspective-grid { display: none; }
  .particle:nth-child(n+13) { display: none; }
  .orb { filter: blur(120px); } /* softer on mobile */
}
```

- [ ] **Step 3: Build to verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/animated-background.tsx src/app/globals.css
git commit -m "feat: add AnimatedBackground component with orbs, grid, particles, noise"
```

---

### Task 4: Integrate AnimatedBackground into Layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Import and render AnimatedBackground**

In `src/app/[locale]/layout.tsx`, import the component and render it as the first child inside the providers, before `<Navbar />`:

```tsx
import { AnimatedBackground } from "@/components/shared/animated-background";
```

Add `<AnimatedBackground />` right after the opening provider wrapper, before `<Navbar />`. Ensure all page content has `position: relative; z-index: 2;` by adding a wrapper div or class to `<main>`.

- [ ] **Step 2: Ensure main content sits above background**

The `<main>` element should have `relative z-[2]` added to its className. The Navbar already has `z-50` so it's fine.

- [ ] **Step 3: Build and verify visually**

Run: `cd /home/ubuntu/people_in_tech && npm run dev`
Open the site and verify the animated background renders on all pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: integrate AnimatedBackground into locale layout"
```

---

## Chunk 3: Navbar & Footer Redesign

### Task 5: Redesign Navbar

**Files:**
- Modify: `src/components/layout/navbar.tsx`

- [ ] **Step 1: Update navbar styling**

Replace the navbar wrapper styling with frosted glass effect:
- Background: `bg-[oklch(0.07_0.01_260_/_0.6)]` (semi-transparent base)
- Backdrop: `backdrop-blur-[16px] backdrop-saturate-[1.2]`
- Border: `border-b border-white/[0.04]`
- Keep `fixed inset-x-0 top-0 z-50`

- [ ] **Step 2: Update logo to "Hiring." with Space Grotesk**

Replace the current text logo with:
```tsx
<Link href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
  Hiring<span className="text-primary">.</span>
</Link>
```

(Ensure `font-display` is the Tailwind utility mapped from `--font-display`.)

- [ ] **Step 3: Update nav link styling**

Nav links should use: `text-[13px] font-medium text-white/40 hover:text-white/80 transition-colors`. Active state: `text-foreground`.

- [ ] **Step 4: Update auth buttons**

- Sign In: ghost button — `text-[13px] font-medium text-white/50 hover:text-white`
- Get Started: primary — `bg-primary text-primary-foreground text-[13px] font-semibold rounded-lg px-[18px] py-2 hover:bg-[oklch(0.92_0.27_128)] hover:shadow-[0_4px_16px_oklch(0.88_0.27_128_/_0.25)]`

- [ ] **Step 5: Update mobile sheet styling**

The mobile hamburger Sheet should get the same frosted glass treatment. Sheet content background should match the new deeper background.

- [ ] **Step 6: Build and verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/navbar.tsx
git commit -m "feat(navbar): frosted glass, Space Grotesk logo, updated styling"
```

---

### Task 6: Redesign Footer

**Files:**
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Update footer to match spec**

Replace current footer with:
- Remove gradient top border
- Use `border-t border-white/[0.04]` instead
- Logo: "Hiring." in Space Grotesk (same as navbar)
- Subtitle: "Discover Greece's tech ecosystem. Powered by POS4work Innovation Hub."
- 3 link columns (Platform, Company, Legal) instead of 4
- Links: `text-[13px] text-white/40 hover:text-white transition-colors`
- Column headers: `text-[11px] uppercase tracking-[1.5px] font-semibold text-white/30`
- Copyright: `text-[12px] text-white/15`

- [ ] **Step 2: Build and verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat(footer): clean column layout, updated styling"
```

---

### Task 7: Update Mobile Nav

**Files:**
- Modify: `src/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Update mobile nav styling**

Update the bottom tab bar to match the new design:
- Background: frosted glass like navbar (`bg-[oklch(0.07_0.01_260_/_0.6)] backdrop-blur-[16px]`)
- Border: `border-t border-white/[0.04]`
- Active tab indicator: green accent bar on top, `text-primary` color
- Inactive: `text-white/40`

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/mobile-nav.tsx
git commit -m "feat(mobile-nav): frosted glass styling to match new navbar"
```

---

## Chunk 4: Homepage Redesign

### Task 8: Redesign Hero Section

**Files:**
- Modify: `src/components/landing/hero-section.tsx`

- [ ] **Step 1: Rewrite hero section**

Replace the current hero with the spec design:
- Remove announcement pill
- H1: `font-display text-4xl md:text-5xl lg:text-[76px] font-bold tracking-[-0.04em] text-foreground leading-[1.02]`
  - Line 1: "Greece's Tech"
  - Line 2: `<span className="text-white/[0.18]">Starts Here.</span>`
- Subtitle: 17px, `text-white/[0.38]`, max-w-[440px], centered
- Search bar: max-w-[540px], with search icon (Lucide `Search`) and "⌘K" hint badge (decorative only)
- CTA row: "Explore Companies" (primary button) + "I'm a Company" (secondary/outline)
- Stats row: 3 stats (Companies, Open Roles, Sectors), first stat green, others white. Use `font-display` for numbers.

Keep the `AnimatedCounter` component for stats. Remove the radial gradient background (the `AnimatedBackground` handles this now).

- [ ] **Step 2: Build and verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hero-section.tsx
git commit -m "feat(hero): Space Grotesk headline, search bar, new layout per spec"
```

---

### Task 9: Create Scrolling Ticker Component

**Files:**
- Create: `src/components/landing/ticker.tsx`

- [ ] **Step 1: Create ticker component**

Create `src/components/landing/ticker.tsx` as a Client Component. Two rows of scrolling pill chips:
- Row 1 (scrolling right): Industries from the database (passed as props)
- Row 2 (scrolling left): Locations + technologies
- CSS animation for seamless infinite scroll (duplicate items for seamless loop)
- Hover pauses animation
- Chip hover: green border + green text
- Edge masks: CSS `mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent)`

The component receives `industries: string[]` and `techAndLocations: string[]` as props.

- [ ] **Step 2: Add ticker CSS to globals.css**

```css
/* Ticker */
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes ticker-scroll-reverse {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/ticker.tsx src/app/globals.css
git commit -m "feat: add scrolling ticker component for industries and tech"
```

---

### Task 10: Redesign How It Works Section

**Files:**
- Modify: `src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Rewrite how-it-works**

Replace 3-step inline icons with 3 glassmorphic cards:
- Card: `rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-6 text-center`
- Step number: top-right, `font-display text-xs font-semibold text-primary/30`
- Icon: 48px green-tinted box with Lucide SVG icon (Search, Bookmark, Bell)
- Title: `font-display text-base font-semibold`
- Description: `text-[13px] text-white/[0.35] leading-relaxed`

Steps:
1. "Explore" — Search icon — "Browse 20+ innovative tech companies in Greece. Filter by industry, location, and tech stack."
2. "Save & Track" — Bookmark icon — "Bookmark companies you're interested in. Build your personal watchlist of employers you care about."
3. "Get Notified" — Bell icon — "Receive alerts when your saved companies post new roles or host events. Never miss an opportunity."

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/how-it-works.tsx
git commit -m "feat(how-it-works): glassmorphic cards with Explore, Save, Notify"
```

---

### Task 11: Update Featured Companies Section

**Files:**
- Modify: `src/components/landing/featured-companies.tsx`

- [ ] **Step 1: Update section header pattern**

Replace current section header with:
- Left: `font-display text-2xl font-semibold text-foreground tracking-tight`
- Right: `text-[13px] text-primary/60 hover:text-primary font-medium` link

Change from horizontal scroll carousel to a 3-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`). Show 6 companies.

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/featured-companies.tsx
git commit -m "feat(featured-companies): grid layout with section header"
```

---

### Task 12: Update Remaining Landing Sections

**Files:**
- Modify: `src/components/landing/upcoming-events.tsx`
- Modify: `src/components/landing/newsletter-cta.tsx`
- Modify: `src/components/landing/for-companies-cta.tsx`
- Modify: `src/app/[locale]/(main)/page.tsx`

- [ ] **Step 1: Update upcoming-events section header**

Same pattern as featured companies: `font-display` title + "View all →" link.

- [ ] **Step 2: Update newsletter-cta styling**

Centered layout: `font-display text-[22px] font-semibold` title, muted subtitle, inline email input + primary subscribe button. Remove the card wrapper border — keep it minimal.

- [ ] **Step 3: Update for-companies-cta**

Replace with gradient-border card:
```
border border-primary/[0.08]
bg-gradient-to-br from-primary/[0.03] to-background/80
backdrop-blur-[12px]
```
Left side: `font-display text-[28px] font-bold` + subtitle. Right side: "Claim Your Page" primary button.

- [ ] **Step 4: Update homepage page.tsx to include ticker**

Import the new `Ticker` component and render it between HeroSection and HowItWorks. Pass industries and tech/locations from the server data.

- [ ] **Step 5: Build and verify full homepage**

Run: `cd /home/ubuntu/people_in_tech && npm run dev`
Visually check the full homepage flow matches the mockup.

- [ ] **Step 6: Commit**

```bash
git add src/components/landing/ src/app/[locale]/(main)/page.tsx
git commit -m "feat(homepage): complete landing page redesign with ticker, updated sections"
```

---

## Chunk 5: Card Components & Browse Pages

### Task 13: Redesign Company Card

**Files:**
- Modify: `src/components/shared/company-card.tsx`

- [ ] **Step 1: Update company card styling**

Apply spec card design:
- Card: `rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-[22px]`
- Hover: `hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]`
- Logo: 44px, `rounded-[11px]`, initial letter fallback
- Name: 15px, font-semibold, with green verified badge SVG
- Meta line: `text-xs text-white/30` — "Industry · Location"
- Tags: max 3, `rounded-md bg-white/[0.03] border border-white/[0.04] text-[11px] text-white/40`
- Footer: divider line, "Founded YYYY · Size" left, "X open roles" right (green if > 0)
- Transition: `transition-all duration-300`

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/company-card.tsx
git commit -m "feat(company-card): glassmorphic card with spec styling"
```

---

### Task 14: Redesign Job Card

**Files:**
- Modify: `src/components/jobs/job-card.tsx`

- [ ] **Step 1: Update to horizontal list card**

Replace current card layout with horizontal list item:
- Container: `rounded-[14px] border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] flex items-center gap-4 p-[18px_22px]`
- Hover: `hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-[2px]`
- Left: company logo (40px)
- Center: title (14px, 600) + company · location (12px, muted)
- Right: badges (type + work mode) + "View →" button

Keep the save functionality (Bookmark icon).

- [ ] **Step 2: Commit**

```bash
git add src/components/jobs/job-card.tsx
git commit -m "feat(job-card): horizontal list card with View button"
```

---

### Task 15: Redesign Event Card

**Files:**
- Modify: `src/components/shared/event-card.tsx`

- [ ] **Step 1: Update event card**

Apply spec design:
- Card: same glassmorphic styling as company card
- Date block: `rounded-[10px] bg-primary/[0.06] border border-primary/[0.1] inline-flex flex-col items-center p-[8px_14px]`
  - Month: `text-[10px] uppercase text-primary font-semibold tracking-wider`
  - Day: `font-display text-[22px] font-bold text-foreground leading-none`
- Title: 15px, font-semibold
- Host: `text-xs text-primary/50 font-medium`
- Type badge: color-coded (workshop=blue, meetup=purple, webinar=amber, talent=green)
- "View Event →" button linking to external URL

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/event-card.tsx
git commit -m "feat(event-card): date block, host, type badge, external link"
```

---

### Task 16: Update Discover Page

**Files:**
- Modify: `src/components/discover/discover-client.tsx`
- Modify: `src/components/discover/search-bar.tsx`
- Modify: `src/components/discover/filter-bar.tsx`

- [ ] **Step 1: Update page title styling**

Page title: `font-display text-[42px] font-bold tracking-[-0.03em] text-foreground text-center pt-12 mb-2`
Subtitle: `text-base text-white/[0.35] text-center mb-9`

- [ ] **Step 2: Update search bar styling**

Match spec: `rounded-[14px] border border-white/[0.07] bg-white/[0.03] backdrop-blur-[12px]`, focus ring with green tint.

- [ ] **Step 3: Update filter chips**

Replace current filter bar with pill chips:
`rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-white/[0.45]`
Active: `border-primary/[0.25] bg-primary/[0.05] text-primary`

- [ ] **Step 4: Commit**

```bash
git add src/components/discover/
git commit -m "feat(discover): updated search, filter chips, page title styling"
```

---

### Task 17: Update Jobs Page

**Files:**
- Modify: `src/components/jobs/jobs-client.tsx`
- Modify: `src/components/jobs/job-filters.tsx`

- [ ] **Step 1: Update jobs page layout**

Same pattern as discover: `font-display` page title, subtitle, search bar, filter chips (All Types | Remote | Hybrid | On-site), results meta with sort, vertical job card list.

- [ ] **Step 2: Commit**

```bash
git add src/components/jobs/
git commit -m "feat(jobs): updated page title, filters, layout"
```

---

### Task 18: Update Events Page

**Files:**
- Modify: `src/components/events/events-client.tsx`
- Modify: `src/components/events/event-filters.tsx`

- [ ] **Step 1: Update events page layout**

Same pattern: `font-display` page title, centered filter chips (All Events | Workshop | Meetup | Webinar | Talent Session | In Person | Online), 3-column event card grid.

- [ ] **Step 2: Commit**

```bash
git add src/components/events/
git commit -m "feat(events): updated page title, filter chips, grid layout"
```

---

## Chunk 6: Company Profile & Job Detail Pages

### Task 19: Redesign Company Profile Page

**Files:**
- Modify: `src/components/company/company-hero.tsx`
- Modify: `src/components/company/company-tabs.tsx`
- Modify: `src/components/company/about-tab.tsx`

- [ ] **Step 1: Update company hero**

Apply spec design:
- Cover: gradient background (160px), `rounded-t-[20px]`
- Logo: 72px, overlapping cover with negative margin
- Name: `font-display text-[26px] font-bold` + verified badge
- Badges row: pill badges for status, industry, locations, size, founded
- Description: `text-sm text-white/40 leading-relaxed max-w-[600px]`
- Actions: Follow/Save (primary) + Visit Website (outline) + LinkedIn (outline)
- Claim button for auto-generated companies

- [ ] **Step 2: Update tabs styling**

Tab bar: bottom border `border-white/[0.04]`. Tabs: `text-[13px] font-medium text-white/40`. Active: `text-primary border-b-2 border-primary`.

- [ ] **Step 3: Update about tab layout**

Two-column grid: left (description + tech stack tags + embedded job cards), right (info card with key-value rows).

- [ ] **Step 4: Commit**

```bash
git add src/components/company/
git commit -m "feat(company-profile): redesigned hero, tabs, about layout"
```

---

### Task 20: Create Job Detail Page

**Files:**
- Create: `src/app/[locale]/(main)/jobs/[id]/page.tsx`
- Create: `src/components/jobs/job-detail.tsx`

- [ ] **Step 1: Create the route page (server component)**

`src/app/[locale]/(main)/jobs/[id]/page.tsx`:
- Fetch job by ID with company data included
- 404 if not found
- Pass to JobDetail client component

- [ ] **Step 2: Create JobDetail component**

`src/components/jobs/job-detail.tsx`:
- Breadcrumb: Jobs › Company › Title
- Two-column layout (2fr 1fr)
- Left: logo + title (24px `font-display`) + company name (green) + badges + description sections (gracefully hidden when empty)
- Right sidebar: "Apply on [company].com →" primary button (external link), Save Job button, info card (location, type, posted date), company mini-card (clickable to profile), "More roles at [Company]" section

- [ ] **Step 3: Update job card "View →" to link to detail page**

In `src/components/jobs/job-card.tsx`, change the "View →" button to a Link pointing to `/jobs/${job.id}`.

- [ ] **Step 4: Build and verify**

Run: `cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -5`

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/(main)/jobs/[id]/ src/components/jobs/job-detail.tsx src/components/jobs/job-card.tsx
git commit -m "feat: add job detail page with two-column layout and external apply"
```

---

## Chunk 7: Divider & Section Patterns

### Task 21: Create Shared Section Components

**Files:**
- Create: `src/components/shared/section-header.tsx`
- Create: `src/components/shared/divider.tsx`
- Create: `src/components/shared/page-header.tsx`

- [ ] **Step 1: Create SectionHeader component**

Reusable component for "Featured Companies" / "Latest Jobs" type headers:
```tsx
interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
}
```
Renders: `font-display text-2xl font-semibold` left, optional green link right.

- [ ] **Step 2: Create Divider component**

Simple gradient line: `h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent`

- [ ] **Step 3: Create PageHeader component**

Reusable for Discover/Jobs/Events page tops:
```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}
```
Renders: centered `font-display text-[42px]` title + muted subtitle.

- [ ] **Step 4: Replace hardcoded headers across all pages with these shared components**

Update homepage sections, discover, jobs, events pages to use the shared components.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/ src/components/landing/ src/components/discover/ src/components/jobs/ src/components/events/
git commit -m "feat: extract shared SectionHeader, Divider, PageHeader components"
```

---

### Task 22: Final Visual Verification

- [ ] **Step 1: Run full build**

```bash
cd /home/ubuntu/people_in_tech && npm run build 2>&1 | tail -10
```

- [ ] **Step 2: Start dev server and verify all pages**

```bash
npm run dev
```

Check each page:
- Homepage: Hero, ticker, how-it-works, companies, jobs, events, CTAs, newsletter, footer
- /discover: Search, filters, company grid
- /jobs: Search, filters, job list, click through to job detail
- /events: Filters, event grid
- /companies/[slug]: Profile hero, tabs, about tab
- Animated background renders on all pages
- Mobile responsive at 375px width

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual polish and responsive adjustments"
```

---

## Summary

This plan covers **22 tasks** across **7 chunks**:

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1. Tokens & Fonts | 1–2 | Deeper background, Space Grotesk font |
| 2. Animated Background | 3–4 | Full animated background on all pages |
| 3. Navbar & Footer | 5–7 | Frosted glass nav, clean footer, mobile nav |
| 4. Homepage | 8–12 | Complete homepage redesign |
| 5. Cards & Browse | 13–18 | All card types + discover/jobs/events pages |
| 6. Detail Pages | 19–20 | Company profile + new job detail page |
| 7. Shared Components | 21–22 | DRY section headers + final verification |

**Next plan:** `2026-03-16-ui-ux-redesign-user-flows.md` — Auth, onboarding, candidate dashboard, admin dashboard, company flows, schema migrations.
