# UI/UX Redesign — Design Specification

**Date:** 2026-03-16
**Status:** Draft
**Project:** Hiring Partners MVP

---

## 1. Overview

Complete UI/UX redesign of the Hiring Partners platform — an employer discovery and talent community aggregator for Greece's tech ecosystem, operated by POS4work Innovation Hub.

### Product Model

**MVP (Model 1 — Curated Aggregator):** Candidates browse companies, jobs, and events. Jobs and events link externally. Candidates save items to their watchlist and receive alerts. Lightweight profiles stored for future use.

**Future (Model 2 — Two-Sided Talent Pool):** Companies browse candidate profiles. Matchmaking. Express interest. The MVP foundation must support this evolution without a rewrite.

### Three User Types

1. **Candidates** — Students, graduates, junior professionals looking for work in Greek tech
2. **Company Reps** — Representatives who claim/manage company pages, post jobs, publish events
3. **Admin (POS4work)** — Platform operators who manage all content, review claims, send newsletters

---

## 2. Design Direction

### Visual Identity

- **Aesthetic:** Contemporary dark tech — not flat black, not cyberpunk. Rich, layered, animated. Inspired by HackTheBox's energy but with Apple-level typography refinement.
- **Background:** The animated background IS the visual identity. It consists of:
  - **Morphing gradient orbs** (6 total): green, blue, purple. Large (500–1000px), slowly drifting, blur(90px). Opacity 0.08–0.18.
  - **Perspective grid**: Faint green grid lines in perspective (rotateX 60deg), fading radially. Pulsing opacity. Horizon glow line.
  - **Floating particles** (24 total): Tiny dots (2–4px) drifting upward. Mixed green/blue/purple. 14–23s animation duration.
  - **Noise texture**: Subtle SVG fractal noise overlay at 0.03 opacity.
- **Base color:** `#06080c` (near-black with blue undertone, NOT pure black)
- **Accent:** `#9fef00` (neon lime) — used sparingly: primary CTAs, active states, stat highlights, notification dots
- **Secondary accents:** Blue `rgba(60,130,246)` and purple `rgba(130,80,220)` in background elements only

### Typography

- **Headlines:** Space Grotesk — 700 weight, tight letter-spacing (-0.02em to -0.04em)
- **Body/UI:** Inter — 400–600 weight
- **Sizes:** Hero h1: 72–76px. Page titles: 42px. Section headers: 24px. Body: 14–15px. Small/meta: 11–12px.
- **Text colors:** Primary text: `#f0f0f0` (NOT pure white). Secondary: `rgba(255,255,255,0.4)`. Muted: `rgba(255,255,255,0.25)`.

### Component Patterns

- **Cards:** `border-radius: 16px`, `border: 1px solid rgba(255,255,255,0.05)`, `background: rgba(255,255,255,0.02)`, `backdrop-filter: blur(8px)`. Hover: border brightens to 0.1, translateY(-3px), shadow.
- **Buttons primary:** `#9fef00` bg, `#06080c` text, `border-radius: 10px`. Hover: lighter green, translateY(-1px), green glow shadow.
- **Buttons secondary:** Transparent, `border: 1px solid rgba(255,255,255,0.08)`, muted text. Hover: brighter border, white text.
- **Inputs:** Dark bg `rgba(255,255,255,0.03)`, subtle border. Focus: green border + green ring glow.
- **Chips/pills:** `border-radius: 100px`, subtle border, small text. Selected: green border + green bg tint.
- **Tags:** `border-radius: 6px`, very subtle bg + border.

### Navbar

- Sticky, frosted glass: `backdrop-filter: blur(16px) saturate(1.2)`, semi-transparent bg
- Left: Logo "Hiring." (Space Grotesk, dot is green)
- Center: Discover | Jobs | Events (13px, 500 weight)
- Right: Sign In (ghost) | Get Started (primary) — or avatar when logged in
- Admin: Shows "ADMIN" badge next to avatar

---

## 3. Pages & Flows

### 3.1 Homepage (Landing)

**Structure:** Light marketing hero + immediate content dive.

1. **Hero** — centered, max-width 800px
   - H1: Space Grotesk 76px, two lines. Second line faded (`rgba(255,255,255,0.18)`)
   - Subtitle: 17px, muted, 2 lines
   - Search bar: Full width (540px max), with search icon and ⌘K keyboard shortcut hint
   - CTA row: "Explore Companies" (primary) + "I'm a Company" (secondary)
   - Stats: 3 numbers (Companies, Open Roles, Sectors) — first stat in green

2. **Scrolling ticker** — double row
   - Row 1: Industries (HR Tech, FinTech, Cybersecurity, etc.) scrolling right
   - Row 2: Locations + technologies scrolling left
   - Pill chips with hover: green border + green text
   - CSS mask fade on edges

3. **How It Works** — 3 cards in a row
   - Step 01: Explore — "Browse 20+ innovative tech companies..."
   - Step 02: Save & Track — "Bookmark companies you're interested in..."
   - Step 03: Get Notified — "Receive alerts when saved companies post..."
   - Each card: step number top-right, icon in green box, title, description

4. **Featured Companies** — section header with "View all →", 6 company cards in 3-column grid

5. **Latest Jobs** — section header with "View all →", 6 job cards in vertical list

6. **Upcoming Events** — section header with "View all →", 3 event cards in 3-column grid

7. **For Companies CTA** — gradient-border card: "Are you a company?" + "Claim Your Page" button

8. **Newsletter** — centered: title, subtitle, email input + subscribe button

9. **Footer** — logo + tagline left, 3 link columns right (Platform, Company, Legal), copyright bottom

### 3.2 Discover Companies

- Page title: "Discover Companies" (42px)
- Subtitle text
- Search bar (full width, centered)
- Filter chips: All | HR Tech | FinTech | E-commerce | Cybersecurity | Gaming | EdTech | AI/MarTech | PropTech | Mobility | DevOps | HealthTech
- Results meta bar: "Showing X companies" + sort dropdown
- Company cards in 3-column grid

**Company Card:**
- Logo (44px square, rounded, initial letter fallback)
- Name + verified badge (green checkmark SVG)
- Meta line: Industry · Location(s)
- Tech stack tags (3 max)
- Footer: "Founded YYYY · Size" left, "X open roles" right (green if > 0)

### 3.3 Jobs

- Page title: "Job Openings"
- Search bar
- Filter chips: All Types | Remote | Hybrid | On-site
- Results meta: "X open positions" + sort dropdown
- Job cards in vertical list

**Job Card (list item):**
- Company logo (40px)
- Title (14px, 600 weight)
- Company name · location (12px, muted)
- Badges: type (Full-time), work mode (Remote/Hybrid/On-site — Remote gets green badge)
- "View →" button on right

### 3.4 Job Detail Page

Full detail page (not a modal). Breadcrumb navigation: Jobs › Company › Title

**Two-column layout:**

Left (main):
- Logo + title (24px Space Grotesk) + company name (green) + badges
- Sections: About the Role, What You'll Do (bullet list), Requirements (bullet list), Tech Stack (tag chips)

Right (sidebar):
- Apply button: "Apply on company.com →" (primary, full width) — links externally
- Save Job button (outline, full width)
- Info card: Location, Type, Experience, Posted date
- Company mini-card (clickable → company profile)
- "More roles at [Company]" section with mini job cards

### 3.5 Events

- Page title: "Events"
- Filter chips: All Events | Workshop | Meetup | Webinar | Talent Session | In Person | Online
- Event cards in 3-column grid

**Event Card:**
- Date block (green-tinted rounded box): month abbreviation + day number
- Event title
- Host company name (green text)
- Meta: type badge (color-coded: blue=workshop, purple=meetup, amber=webinar, green=talent session) + location/time
- Capacity info
- "View Event →" button — links externally

### 3.6 Company Profile

**Profile Hero:**
- Cover area (gradient background, 160px height)
- Logo (72px, overlapping cover)
- Company name (26px Space Grotesk) + verified badge
- Badges row: Verified/Auto-generated, Industry, Location(s), Size, Founded year
- Description text
- Actions: Follow/Save button (primary) + Visit Website (outline) + LinkedIn (outline)
- If auto-generated: "Claim this page" button

**Tabs:** About | Open Roles (count) | Events (count) | Gallery

**About tab — two columns:**
- Left: Description, Tech Stack tags, Open Roles (embedded job cards)
- Right: Info card (Industry, Founded, Size, Locations, Website, Open Roles count)

### 3.7 Auth Flows

**Sign Up (2 steps):**

Step 1 — Create Account:
- Full name, email, password
- "Continue with LinkedIn" (OAuth)
- Progress bar (2 steps)

Step 2 — Your Preferences (lightweight profile, Model B):
- Experience level (dropdown: Student / Graduate / Junior)
- LinkedIn profile URL (optional)
- Industry interest chips (multi-select)
- Preferred location chips (multi-select)
- Notification toggles: Job alerts, Event notifications, Weekly digest
- "Start Exploring →" → redirects to /discover

**Sign In:**
- Email + password
- "Continue with LinkedIn"
- "Forgot password?" link

**Forgot Password (3 steps):**
- Enter email → "Send Reset Link"
- Confirmation: "Check your email" with resend option
- Set new password (new + confirm)

### 3.8 Candidate Dashboard

**Nav state:** Avatar with initials replaces Sign In/Get Started buttons

**Header:** "Dashboard" title + "Welcome back, [Name]"

**Stats row (4 cards):** Saved Companies | Saved Jobs | New Alerts | Saved Events

**Tabs:** Saved Companies | Saved Jobs | Alerts | Saved Events | Settings

**Saved Companies tab:** 3-column grid of mini company cards (logo, name, industry, open roles count)

**Saved Jobs tab:** Vertical list of saved job cards with badge showing "X new" for new postings from saved companies. Each clickable → job detail page.

**Alerts tab:** Activity feed with:
- Green dot (unread) / gray dot (read)
- Text: "[Company] posted a new role: [Title]" or "[Company] is hosting: [Event]"
- Timestamp
- Action button: "View →" (for jobs) or "View Event →" (for events) — each links to the appropriate detail page or external link

**Saved Events tab:** List of saved events with date blocks, similar to events page cards

**Settings tab — two columns:**
- Left (Profile): Name, email (disabled), LinkedIn URL, experience level. Save Changes button.
- Right (Preferences): Industry chips, location chips, email notification toggles (job alerts, event notifications, weekly digest), Delete Account button.

### 3.9 Company Claim Flow

**From company profile page** (auto-generated companies):
- "Claim this page" button opens modal

**Claim Modal:**
- Title: "Claim [Company Name]"
- Explanation text: what claiming unlocks (edit profile, post jobs, publish events, analytics)
- Fields: Work email, Role at company, Phone (optional), Additional notes (optional)
- Submit → confirmation screen: "Claim Submitted" + "We'll review in 24–48 hours"

**For companies not on the platform:**
- "List your company" form (accessible from "I'm a Company" CTA or footer)
- Fields: Company name, Website, Contact email, Contact phone (optional), Your role, Message
- Submit → same confirmation pattern
- Admin gets email notification

### 3.10 Admin Dashboard

**Layout:** Sidebar (220px fixed) + main content area

**Sidebar Navigation:**
- Overview (KPI dashboard)
- Companies (CRUD table)
- Candidates (table with filters)
- Claims (queue with pending badge count)
- Job Listings (CRUD table)
- Events (CRUD management)
- Newsletters (composer)
- Analytics (charts)

**Overview:**
- 4 KPI cards: Companies (with trend), Candidates (with trend), Pending Claims (amber if > 0), Active Jobs (with trend)
- Signup/follow trend chart (Recharts)
- Pending claims preview (first 3)
- Top companies table preview

**Companies Section:**
- Table: Company name (with logo), Industry, Status (Verified/Auto-generated/Claim Pending), Jobs count, Followers count
- Actions: Edit, View, Delete
- "Add Company" button → full form: Name, Industry, Website, LinkedIn, Locations, Size, Description, Tech Stack chips, Founded Year, Status

**Claims Queue:**
- Each claim card shows: Company name, Claimant email, Claimant phone (if provided), Claimant role, Submission date, Notes
- Actions: Approve (→ company becomes Verified, claimant gets Company Rep role) | Reject (→ claimant notified)
- **Email notification to admin** when new claim arrives, with direct link to review queue

**Job Listings Section:**
- Table of all jobs with Company, Title, Location, Type, Status
- "Add Job" button → form: Title, Company (dropdown), Location, Work Type, External URL, Description
- Publish / Save as Draft

**Events Section:**
- Table with CRUD
- "Add Event" → form: Title, Company (or Platform-hosted), Type, Date, Time, Location/Online, External URL, Capacity, Description

**Newsletters Section:**
- Composer with template editor
- Preview + Send functionality

**Analytics Section:**
- Platform growth charts (signups over time, follows over time)
- Engagement metrics

### 3.11 Company Dashboard (for verified Company Reps)

After a company claim is approved, the rep gets access to:
- Profile editor (description, logo, tech stack, locations)
- Job listings management (CRUD)
- Events management (CRUD)
- Follower analytics (count, growth chart)
- Gallery management

This uses the same sidebar layout pattern as the admin dashboard but with company-specific navigation.

---

## 4. Interactions & Patterns

### External Links
Both jobs and events use the aggregator pattern:
- **Jobs:** "Apply on [company].com →" button links to external careers page
- **Events:** "View Event →" button links to external event page (Eventbrite, Meetup, etc.)
- No application or registration happens on the platform

### Save Pattern
Consistent across all content types:
- Save/unsave companies, jobs, and events
- All saved items appear in candidate dashboard under respective tabs
- Saving a company triggers alerts when that company posts new jobs or events

### Notifications
- **In-app alerts tab:** Feed of new activity from saved companies
- **Email notifications (opt-in):**
  - Job alerts: Instant email when saved companies post new roles
  - Event notifications: When events match interest preferences
  - Weekly digest: Monday summary of new roles, events, and companies

### Admin Email Notifications
- New company claim → email to admin with claimant details + link to review queue
- New "List your company" request → same pattern

---

## 5. Technical Notes

### Stack (unchanged)
- Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (base-nova)
- Prisma + SQLite (MVP) / PostgreSQL (production)
- NextAuth (credentials + LinkedIn OAuth provider)
- next-intl (en/el)
- Recharts for analytics charts

### Fonts
- Replace current font loading with: Space Grotesk (400–700) + Inter (400–600)
- Space Grotesk for all headlines, stats, logo
- Inter for body, UI, labels

### Background Implementation
- All animated background elements should be a shared `<AnimatedBackground />` component
- Used on all pages (not just homepage)
- Performance: Use CSS animations only (no JS animation libraries). `will-change: transform` on orbs. Particles use CSS `animation` not requestAnimationFrame.
- Reduce particle count on mobile (12 instead of 24)

### Rollback Strategy
- All work on a feature branch (e.g., `feat/ui-ux-redesign`)
- Atomic commits per page/component
- Can revert to main at any point

---

## 6. Out of Scope (MVP)

- Light mode / theme toggle
- Candidate public profiles (Model 2 — future)
- Company browsing candidate talent pool (Model 2 — future)
- In-platform job applications
- In-platform event registration
- Real-time notifications (WebSocket)
- Mobile native app
- Search autocomplete / command palette (Cmd+K) — placeholder only for MVP
