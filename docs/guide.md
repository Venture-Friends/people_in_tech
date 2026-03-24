# Hiring Partners -- User & Admin Guide

**Platform:** Hiring Partners (POS4work)
**Stack:** Next.js 16, Prisma, NextAuth, React Email
**Last updated:** 2026-03-19

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [User Flows](#2-user-flows)
3. [Company Claim Flows](#3-company-claim-flows)
4. [Admin Guide](#4-admin-guide)
5. [Email System](#5-email-system)
6. [Onboarding Options Reference](#6-onboarding-options-reference)
7. [API Reference](#7-api-reference)

---

## 1. Getting Started

### Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | -- | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | -- | Secret for signing sessions and JWT tokens |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public base URL of the application |
| `EMAIL_PROVIDER` | No | `console` | Email provider: `console` (dev) or `smtp` (production) |
| `EMAIL_FROM` | No | `Hiring Partners <noreply@hiringpartners.gr>` | Sender address for all emails |
| `SMTP_HOST` | For SMTP | -- | SMTP server hostname |
| `SMTP_PORT` | For SMTP | `587` | SMTP server port |
| `SMTP_USER` | For SMTP | -- | SMTP username |
| `SMTP_PASS` | For SMTP | -- | SMTP password |
| `CRON_SECRET` | Yes | -- | Shared secret for cron job authentication |

### Database Setup

```bash
# Install dependencies
npm install

# Push schema to database
npx prisma db push

# (Optional) Generate Prisma client
npx prisma generate
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

The app runs at `http://localhost:3000` by default. It supports two locales: English (`/en`) and Greek (`/el`).

---

## 2. User Flows

### 2.1 Registration & Onboarding

**Flow:** Register --> Verify Email --> Onboarding Wizard --> Dashboard

1. **Register** at `/register` with name, email, and password. The user is assigned the `CANDIDATE` role.
2. **Email verification** is sent automatically upon registration (24-hour token expiry). A welcome email is also sent.
3. **Onboarding wizard** (`/onboarding`) is a multi-step form with a step indicator:
   - **Step 1 -- About You:** Full name, headline, experience level (10 options across IC and Management tracks), LinkedIn URL, language preference (EN/EL).
   - **Step 2 -- Interests:** Role interests (16 roles, max 5 selections), skills (12 categories with search-as-you-type + free-form entry), industries (16 options), preferred locations (8 options).
   - **Step 3 -- Preferences:** Email notification opt-ins for weekly digest, events, and newsletter.
4. **Dashboard** becomes accessible after completing onboarding.

### 2.2 Password Reset

**Flow:** Forgot Password --> Email Link --> Set New Password

1. Visit `/forgot-password` and enter your email address.
2. The system always returns a success message (prevents email enumeration).
3. If the account exists, a password-reset email is sent with a link valid for **1 hour**.
4. Rate limit: maximum 3 reset requests per email per hour.
5. Click the link to reach `/reset-password` and set a new password (minimum 6 characters).
6. Tokens are single-use -- once used, the same link cannot be reused.

### 2.3 Email Verification

- **Automatic:** A verification email is sent at registration with a **24-hour** token expiry.
- **Resend:** Logged-in users can request a new verification email via `POST /api/auth/resend-verification`. This deletes any existing tokens and issues a fresh one.
- **Verification page:** `/verify-email?token=xxx` validates the token and marks the account as verified.

### 2.4 Discovering Companies

**Page:** `/discover`

**Filters:**

| Filter | Values |
|--------|--------|
| Search | Free-text (matches name, description, technologies) |
| Industry | Company industry field |
| Location | Company locations field |
| Size | Company size field |
| Has Open Roles | Only companies with active job listings |
| Verified | Only companies with VERIFIED status |

**Sort options:**

| Sort | Behavior |
|------|----------|
| Most Followed | Follower count descending (default) |
| Newest | Creation date descending |
| Alphabetical (A-Z) | Company name ascending |
| Most Open Roles | Active job count descending |

Results are paginated (20 per page by default).

### 2.5 Job Browsing

**Page:** `/jobs`

**Filters:**

| Filter | Values |
|--------|--------|
| Search | Free-text (matches title, location, company name) |
| Type | REMOTE, HYBRID, ONSITE, or ALL |

**Sort options:**

| Sort | Behavior |
|------|----------|
| Newest | Posted date descending (default) |
| Oldest | Posted date ascending |
| Company (A-Z) | Company name ascending |
| Location | Location ascending |

Job cards are fully clickable and navigate to the job detail page. Results are paginated (20 per page).

### 2.6 Events

**Page:** `/events`

**Filters:**

| Filter | Values |
|--------|--------|
| Type | Event type (WORKSHOP, MEETUP, etc.) or ALL |
| Date Range | Upcoming (default), This Week, This Month, Past |
| Online | Online only, In-person only, or All |

Events are sorted by date (upcoming: ascending, past: descending). Paginated (50 per page).

### 2.7 Following Companies

- **Follow/Unfollow:** Toggle via `POST /api/companies/[id]/follow` (requires login).
- The follow button appears on company profile pages.
- Followed companies appear in the candidate dashboard.
- The follower count updates in real-time on the company card.

### 2.8 Saving Jobs & Events

- **Save/Unsave a job:** Toggle via `POST /api/jobs/[id]/save` (requires login).
- **Save/Unsave an event:** Toggle via `POST /api/events/[id]/save` (requires login).
- **Register/Unregister for event:** Toggle via `POST /api/events/[id]/register` (requires login).
- Saved items appear in the candidate dashboard.

### 2.9 Candidate Profile & Account

- **View/Edit profile:** `GET/PUT /api/candidate/profile` -- update name, headline, experience level, skills, role interests, industries, locations, and email preferences.
- **Delete account:** `DELETE /api/candidate/profile` -- permanently deletes the user and all related data (cascade deletes handle follows, saved items, claims, etc.).
- **Mark alerts read:** `POST /api/candidate/alerts/read` -- updates `lastSeenAlertsAt` timestamp.

---

## 3. Company Claim Flows

### 3.1 Claiming with an Account (Logged In)

1. Visit a company profile page.
2. Click "Claim this company."
3. Fill the claim form: Full Name, Job Title, Work Email, LinkedIn (optional), Message (optional).
4. `POST /api/claims` creates a `CompanyClaim` record with status `PENDING`.
5. If the company status is `AUTO_GENERATED`, it changes to `CLAIMED`.
6. Admin reviews the claim (see Section 4.5).
7. On approval: user role becomes `COMPANY_REP`, company status becomes `VERIFIED`.

**Restrictions:**
- Cannot claim an already-verified company.
- Cannot submit duplicate pending claims for the same company.

### 3.2 Claiming without an Account (Public)

1. Visit a company profile page (not logged in).
2. Click "Claim this company."
3. Fill the form: Full Name, Job Title, Work Email, LinkedIn (optional), Message (optional).
4. `POST /api/claims/public` creates a `PendingClaim` record (not a `CompanyClaim` yet).
5. A verification email is sent to the Work Email provided (24-hour token expiry).
6. Rate limit: maximum 3 pending claims per email per 24 hours.
7. User clicks the verification link in the email.
8. `GET /api/claims/verify?token=xxx` processes the verification:
   - If the user **has an account** (email matches): links the claim to their existing account.
   - If the user **has no account**: auto-creates an account with a random password (email is pre-verified).
   - Creates a `CompanyClaim` record with status `PENDING`.
   - Updates company status to `CLAIMED` if currently `AUTO_GENERATED`.
   - Sends admin notification emails.
9. Admin reviews as normal. On approval, the user becomes `COMPANY_REP`.

### 3.3 Listing a New Company

1. Visit `/list-company`.
2. Fill the form: Company Name, Website, Contact Email, Contact Phone, Your Role, Message.
3. `POST /api/companies/list-request` creates a new company record with status `PENDING` and industry `Other`.
4. If the user is logged in, a `CompanyClaim` is also created linking the user to the company.
5. Email notifications are sent:
   - All admins receive a `claim-admin-alert` email.
   - The requester receives a `claim-submitted` confirmation email.

---

## 4. Admin Guide

All admin routes require the `ADMIN` role. The admin panel is accessible at `/admin`.

### 4.1 Dashboard Overview

**Endpoint:** `GET /api/admin/analytics`

The admin dashboard displays:

- **KPIs:** Total companies, total candidates, pending claims (badge count), active jobs.
- **Top Companies:** Top 5 by follower count.
- **Analytics:** Experience level distribution, top 10 skills, signup trends (30 days), follow trends (30 days).

**Sidebar navigation:** Overview, Companies, Jobs, Events, Claims (with pending count badge), Partners, Content, Newsletter, Candidates, Analytics.

### 4.2 Company Management

| Action | Endpoint | Details |
|--------|----------|---------|
| List all | `GET /api/admin/companies` | Search by name/industry, filter by status |
| Add new | `POST /api/admin/companies` | Name (required), Industry (required), Website, Description. Auto-generates slug. Status set to `AUTO_GENERATED`. |
| Edit | `PUT /api/admin/companies/[id]` | Update name, industry, featured flag, status |
| Delete | `DELETE /api/admin/companies/[id]` | Permanently removes company and cascaded records |
| Feature/Unfeature | `PUT /api/admin/companies/[id]` | Set `featured: true/false` -- featured companies appear in the homepage section |

### 4.3 Company Enrichment

**Endpoint:** `POST /api/admin/companies/[id]/enrich`

Triggered by clicking the sparkle icon on a company row in the admin panel.

**How it works:**
1. The system fetches the company's website URL.
2. Parses the HTML using Cheerio.
3. Extracts data from the page:
   - **Description:** Tries `og:description`, `meta description`, then first `<p>` in an about section.
   - **Logo:** Tries `og:image`, then elements matching `img[class*="logo"]`, `img[alt*="logo"]`, favicon, apple-touch-icon.
   - **LinkedIn URL:** Finds links containing `linkedin.com/company`.
   - **Technologies:** Scans body text for known technology keywords (React, Angular, AWS, Docker, etc.).
4. Returns the extracted data as suggestions.
5. Admin reviews the extracted data in a panel and selects which fields to apply to the company record.

**Requirement:** The company must have a `website` field populated.

### 4.4 Job Scraping

#### Scanning for Jobs

**Endpoint:** `POST /api/admin/companies/[id]/scrape-jobs`

Triggered by clicking the scan icon on a company row.

**Career page discovery order:**
1. Uses the company's `careersUrl` field if set.
2. Falls back to the company `website` -- tries common paths: `/careers`, `/jobs`, `/join`, `/join-us`, `/work-with-us`.
3. Parses the homepage for links containing career-related terms.
4. If a known ATS is detected, follows its URL patterns.

**ATS parsers:**

| ATS | Detection Pattern | Parse Method |
|-----|-------------------|--------------|
| Greenhouse | `boards.greenhouse.io` | JSON API at `/boards/{company}/jobs` |
| Lever | `jobs.lever.co` | Structured HTML with `.posting` elements |
| Workable | `apply.workable.com` | JSON API at `/api/v1/widget/jobs` |
| Generic | Any other URL | Heuristic link scoring (URL patterns, job title keywords, page structure) |

**Each scraped job includes:**
- Title, URL, Location (if found), Type (REMOTE/HYBRID/ONSITE), Department, Description snippet
- Source: `greenhouse`, `lever`, `workable`, or `generic`
- Confidence level: `high`, `medium`, or `low`
- Duplicate flag: `alreadyImported` if the job URL or title matches an existing job for that company

**A `JobScrapeLog` record is created** for each scrape operation, tracking jobs found and jobs added.

#### Importing Jobs

**Endpoint:** `POST /api/admin/companies/[id]/import-jobs`

After reviewing scraped results, the admin selects jobs to import.

- Each selected job becomes a `JobListing` record with status `ACTIVE`.
- Duplicates are skipped (matched by `externalUrl` or `title` for the same company).
- The most recent `JobScrapeLog` is updated with the actual import count.
- Returns: `{ imported, skipped, errors }`.

### 4.5 Claim Review

**Endpoints:**
- `GET /api/admin/claims` -- list all pending claims with company and user details.
- `PUT /api/admin/claims/[id]` -- approve or reject a claim.

**Approve:**
- Sets claim status to `APPROVED`.
- Sets company status to `VERIFIED`.
- Sets user role to `COMPANY_REP`.
- All three updates run in a single database transaction.

**Reject:**
- Sets claim status to `REJECTED`.
- A review note (reason) is **required** when rejecting.

**Restrictions:** Only claims with status `PENDING` can be reviewed. Already-reviewed claims return an error.

### 4.6 Job Management

| Action | Endpoint | Details |
|--------|----------|---------|
| List all | `GET /api/admin/jobs` | Search by title/company name, filter by status |
| Pause/Activate | `PUT /api/admin/jobs/[id]` | Toggle status between `ACTIVE` and `PAUSED` |
| Delete | `DELETE /api/admin/jobs/[id]` | Permanently removes the job listing |

Job rows are clickable in the admin table for viewing detail.

### 4.7 Event Management

| Action | Endpoint | Details |
|--------|----------|---------|
| List all | `GET /api/admin/events` | Includes registration counts |
| Create | `POST /api/admin/events` | Title (required), Date (required), Start Time (required), Description, Type, End Time, Location, Online flag, Capacity. Created as a platform event (`companyId: null`). |
| Edit | `PUT /api/admin/events/[id]` | Update any event field |
| Delete | `DELETE /api/admin/events/[id]` | Permanently removes the event |

### 4.8 Partners Management

Partners are displayed on the homepage in the "Our Partners" section.

| Action | Endpoint | Details |
|--------|----------|---------|
| List all (admin) | `GET /api/admin/partners` | Returns all partners ordered by display order |
| List active (public) | `GET /api/partners` | Returns only active partners (id, name, logo, website) |
| Create | `POST /api/admin/partners` | Name (required), Logo URL (required), Website (optional), Display Order (default 0), Active (default true) |
| Edit | `PUT /api/admin/partners/[id]` | Update name, logo, website, order, active toggle |
| Delete | `DELETE /api/admin/partners/[id]` | Permanently removes the partner |

**Display behavior:** Logos display in grayscale by default, color on hover. Partners with `active: false` are hidden from the public page without deletion.

### 4.9 Content Editing (CMS)

**Endpoints:**
- `GET /api/admin/content` -- list all content blocks, optionally filtered by `locale` query parameter.
- `PUT /api/admin/content` -- batch upsert content blocks.

**Editable content blocks:**

| Section | Key Examples |
|---------|-------------|
| Homepage Hero | `hero.heading`, `hero.subheading`, `hero.cta` |
| About Section | `about.text` |
| Footer | `footer.tagline` |

**How it works:**
- Each content block has a `key`, `value`, and `locale` (EN or EL).
- Server components call `getContent(key, locale, fallback)` which checks the `ContentBlock` database table first.
- If no override exists, the i18n default (from message files) is used as the fallback.
- The CMS layer is purely an override -- the app works without any database content.

**Admin UI:**
- Content blocks are grouped by page section.
- Language toggle (EN / EL) to edit per locale.
- Save updates blocks in batch.

### 4.10 Newsletter

| Action | Endpoint | Details |
|--------|----------|---------|
| List all | `GET /api/admin/newsletters` | Returns all newsletters with creator name, sent status, recipient count |
| Create draft | `POST /api/admin/newsletters` | Subject (required), Content (required). Status set to `DRAFT`. |
| Send | `PUT /api/admin/newsletters/[id]` | Action `send` -- marks newsletter as `SENT`, records recipient count, sets `sentAt` timestamp |

### 4.11 Candidates

**Endpoint:** `GET /api/admin/candidates`

- Search by name/email.
- Filter by experience level.
- **CSV export:** Add `?format=csv` to download as CSV file (columns: Name, Email, Experience Level, Skills, Joined).

### 4.12 Analytics

**Endpoint:** `GET /api/admin/analytics`

Returns:
- KPIs: total companies, total candidates, pending claims, active jobs.
- Top 5 companies by follower count.
- Experience level distribution across all candidate profiles.
- Top 10 skills by usage count.
- 30-day signup and follow trends.

---

## 5. Email System

### 5.1 Provider Setup

The `EMAIL_PROVIDER` environment variable controls which email provider is used:

| Value | Behavior |
|-------|----------|
| `console` (default) | Logs emails to the terminal with formatted output. No emails are actually sent. Ideal for development. |
| `smtp` | Sends real emails via SMTP. Requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`. |

If an unrecognized value is provided, the system falls back to `console` with a warning.

### 5.2 SMTP Configuration

```env
EMAIL_PROVIDER="smtp"
EMAIL_FROM="Hiring Partners <noreply@hiringpartners.gr>"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
```

### 5.3 Templates

All templates use React Email components and match the app's dark theme (background `#0a0e1a`, card `#111827`, accent `#9fef00`).

| Template | Trigger | Recipient |
|----------|---------|-----------|
| `welcome` | User registers | New user |
| `email-verification` | Registration / resend | User |
| `password-reset` | Forgot password request | User |
| `claim-submitted` | Claim created (public or list-company) | Claiming user |
| `claim-approved` | Admin approves claim | Claiming user |
| `claim-rejected` | Admin rejects claim | Claiming user |
| `claim-admin-alert` | Claim created or verified | All admins |
| `weekly-digest` | Cron trigger (weekly) | Users opted into digest |
| `event-announcement` | Event created | Users opted into events |
| `newsletter` | Admin sends newsletter | All subscribers |
| `unsubscribe-confirm` | User unsubscribes | User |

### 5.4 Queue & Retry

- **Single send:** Automatic retry with exponential backoff (delays: 1s, 2s, 4s). Maximum 3 attempts.
- **Batch send:** Processes in chunks of 50 with a 1-second delay between chunks. Failures in a chunk do not stop subsequent chunks.
- **Logging:** Every email (sent or failed) is recorded in the `EmailLog` database table with status, provider ID, and error message.

### 5.5 Weekly Digest

**Endpoint:** `GET /api/cron/weekly-digest`

**Authentication:** Requires `x-cron-secret` header or `?secret=` query parameter matching the `CRON_SECRET` environment variable.

**Behavior:**
1. Counts new companies, jobs, and events from the past 7 days.
2. If nothing new, skips sending entirely.
3. Queries all candidate profiles with `emailDigest: true`.
4. Sends batch emails using the `weekly-digest` template.
5. Each email includes a personalized unsubscribe link.

**Trigger example:**
```bash
curl -H "x-cron-secret: YOUR_CRON_SECRET" https://yourdomain.com/api/cron/weekly-digest
```

### 5.6 Unsubscribe

**Endpoint:** `GET /api/newsletter/unsubscribe?token=xxx`

- Unsubscribe links are JWT-signed with a **30-day expiry**, using `NEXTAUTH_SECRET` as the signing key.
- The JWT payload contains `{ email, type }` where type is `newsletter`, `digest`, `events`, or `all`.
- On unsubscribe:
  - Removes the email from the `NewsletterSubscriber` table.
  - If the email belongs to a registered user, updates their `CandidateProfile` email preferences based on the unsubscribe type.
  - Sends a confirmation email using the `unsubscribe-confirm` template.
  - Redirects to the homepage with `?unsubscribed=true`.

---

## 6. Onboarding Options Reference

### 6.1 Experience Levels (10)

**Individual Contributor Track (7):**

| Value | Label | Description | Years |
|-------|-------|-------------|-------|
| `STUDENT` | Student | Currently enrolled | 0 |
| `FRESH_GRADUATE` | Fresh Graduate | Recently graduated | 0-1 |
| `JUNIOR` | Junior | Early career | 1-2 |
| `MID` | Mid-Level | Building expertise | 3-4 |
| `SENIOR` | Senior | Deep expertise | 5-8 |
| `LEAD` | Lead | Technical/team leadership | 6-10 |
| `STAFF` | Staff / Principal | Organization-wide impact | 8+ |

**Management Track (3):**

| Value | Label | Description | Years |
|-------|-------|-------------|-------|
| `MANAGER` | Manager | People management | 5+ |
| `DIRECTOR` | Director | Department leadership | 10+ |
| `EXECUTIVE` | Executive / C-Level | Company leadership | 12+ |

### 6.2 Role Interests (16, max 5 selections)

**Technical:**
- Software Engineering
- DevOps & Infrastructure
- Data Engineering
- Data Science & Analytics
- Security Engineering
- QA & Testing

**Product & Design:**
- Design
- Product Management
- Engineering Management

**Business:**
- Marketing & Growth
- Sales & Business Dev
- Customer Success & Support
- Operations & Strategy
- Finance, Legal & Compliance
- People, HR & Recruitment
- Other

### 6.3 Skill Categories (12 categories, 95 skills)

| Category | Skills |
|----------|--------|
| **Frontend** | React, Next.js, Vue.js, Angular, TypeScript, JavaScript, HTML/CSS, Tailwind CSS |
| **Backend** | Node.js, Python, Java, Go, Rust, Ruby, PHP, C#/.NET, Django, Spring Boot, REST APIs, GraphQL |
| **Mobile** | React Native, Flutter, Swift/iOS, Kotlin/Android |
| **DevOps** | Docker, Kubernetes, AWS, Azure, GCP, Terraform, CI/CD, Linux, GitHub Actions |
| **Data & ML/AI** | SQL, Python (Data), Pandas, TensorFlow, PyTorch, Spark, dbt, LLMs/GenAI |
| **Security** | Application Security, Penetration Testing, Compliance/GRC |
| **QA** | Test Automation, Cypress, Playwright, API Testing |
| **Design** | UI Design, UX Design, UX Research, Product Design, Figma, Design Systems |
| **Product & Mgmt** | Product Management, Agile/Scrum, Product Analytics, Engineering Management |
| **Marketing** | Digital Marketing, SEO, Content Marketing, Growth Hacking, CRM |
| **Sales & BD** | B2B Sales, SaaS Sales, Account Management, Business Development |
| **Operations** | Project Management, People Operations/HR, Customer Success, Financial Analysis |

Users can also type custom skills not in the predefined list.

### 6.4 Industries (16)

AI/ML, Consulting, Cybersecurity, E-commerce, EdTech, FinTech, Gaming, GreenTech, HealthTech, IoT, Logistics, Media, PropTech, SaaS, Telecom, TravelTech

### 6.5 Locations (8)

Athens, Thessaloniki, Patras, Heraklion, Larissa, Remote, Hybrid, Anywhere in Greece

---

## 7. API Reference

### Authentication Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/[...nextauth]` | -- | NextAuth handler (login, session, callbacks) |
| POST | `/api/auth/register` | Public | Create new user account |
| GET | `/api/auth/verify-email` | Token | Verify email address via token |
| POST | `/api/auth/resend-verification` | User | Resend email verification link |
| POST | `/api/auth/forgot-password` | Public | Request password reset email |
| POST | `/api/auth/reset-password` | Token | Set new password using reset token |

### Company Routes (Public)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/companies` | Public | List/search companies with filters and sort |
| POST | `/api/companies/[id]/follow` | User | Toggle follow/unfollow a company |
| POST | `/api/companies/list-request` | Public | Submit a new company listing request |

### Claim Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/claims` | User | Submit claim for a company (logged in) |
| POST | `/api/claims/public` | Public | Submit claim without login (email verification required) |
| GET | `/api/claims/verify` | Token | Verify work email and activate pending claim |

### Job Routes (Public)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/jobs` | Public | List/search jobs with filters and sort |
| POST | `/api/jobs/[id]/save` | User | Toggle save/unsave a job |

### Event Routes (Public)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/events` | Public | List/filter events by type, date range, online status |
| POST | `/api/events/[id]/save` | User | Toggle save/unsave an event |
| POST | `/api/events/[id]/register` | User | Toggle event registration |

### Candidate Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/candidate/profile` | Candidate | Get candidate profile data |
| PUT | `/api/candidate/profile` | Candidate | Update candidate profile |
| DELETE | `/api/candidate/profile` | Candidate | Delete user account (cascade) |
| POST | `/api/candidate/alerts/read` | Candidate | Mark alerts as read |
| POST | `/api/onboarding` | User | Submit onboarding wizard data |

### Company Dashboard Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/dashboard/company/profile` | Company Rep | Get company profile |
| PUT | `/api/dashboard/company/profile` | Company Rep | Update company profile |
| GET | `/api/dashboard/company/jobs` | Company Rep | List company's jobs |
| POST | `/api/dashboard/company/jobs` | Company Rep | Create a job listing |
| PUT | `/api/dashboard/company/jobs/[id]` | Company Rep | Update a job listing |
| DELETE | `/api/dashboard/company/jobs/[id]` | Company Rep | Delete a job listing |
| GET | `/api/dashboard/company/events` | Company Rep | List company's events |
| POST | `/api/dashboard/company/events` | Company Rep | Create an event |
| PUT | `/api/dashboard/company/events/[id]` | Company Rep | Update an event |
| DELETE | `/api/dashboard/company/events/[id]` | Company Rep | Delete an event |
| GET | `/api/dashboard/company/gallery` | Company Rep | Get company gallery |
| POST | `/api/dashboard/company/gallery` | Company Rep | Upload gallery image |
| GET | `/api/dashboard/company/analytics` | Company Rep | Get company analytics |

### Admin Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/admin/analytics` | Admin | Dashboard KPIs, trends, top companies |
| GET | `/api/admin/candidates` | Admin | List candidates (supports `?format=csv` for export) |
| GET | `/api/admin/claims` | Admin | List pending claims |
| PUT | `/api/admin/claims/[id]` | Admin | Approve or reject a claim |
| GET | `/api/admin/companies` | Admin | List all companies |
| POST | `/api/admin/companies` | Admin | Create a company |
| PUT | `/api/admin/companies/[id]` | Admin | Update a company |
| DELETE | `/api/admin/companies/[id]` | Admin | Delete a company |
| POST | `/api/admin/companies/[id]/enrich` | Admin | Trigger company data enrichment from website |
| POST | `/api/admin/companies/[id]/scrape-jobs` | Admin | Scan company careers page for jobs |
| POST | `/api/admin/companies/[id]/import-jobs` | Admin | Import selected scraped jobs |
| GET | `/api/admin/content` | Admin | List CMS content blocks |
| PUT | `/api/admin/content` | Admin | Batch upsert content blocks |
| GET | `/api/admin/events` | Admin | List all events |
| POST | `/api/admin/events` | Admin | Create an event |
| PUT | `/api/admin/events/[id]` | Admin | Update an event |
| DELETE | `/api/admin/events/[id]` | Admin | Delete an event |
| GET | `/api/admin/jobs` | Admin | List all jobs |
| PUT | `/api/admin/jobs/[id]` | Admin | Toggle job status (ACTIVE/PAUSED) |
| DELETE | `/api/admin/jobs/[id]` | Admin | Delete a job |
| GET | `/api/admin/newsletters` | Admin | List all newsletters |
| POST | `/api/admin/newsletters` | Admin | Create newsletter draft |
| PUT | `/api/admin/newsletters/[id]` | Admin | Send a newsletter |
| GET | `/api/admin/partners` | Admin | List all partners |
| POST | `/api/admin/partners` | Admin | Create a partner |
| PUT | `/api/admin/partners/[id]` | Admin | Update a partner |
| DELETE | `/api/admin/partners/[id]` | Admin | Delete a partner |

### Newsletter & Subscription Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/newsletter/subscribe` | Public | Subscribe email to newsletter |
| GET | `/api/newsletter/unsubscribe` | Token (JWT) | One-click unsubscribe via signed link |

### Cron Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/cron/weekly-digest` | CRON_SECRET | Trigger weekly digest email to opted-in users |

### Other Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/partners` | Public | List active partners (for homepage) |
| POST | `/api/feedback` | Public | Submit visual feedback (screenshot + metadata) |
| GET | `/api/feedback` | Public | List submitted feedback entries |
