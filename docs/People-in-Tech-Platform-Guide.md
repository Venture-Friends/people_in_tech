# People in Tech — Platform Guide

**Greece's Premier Tech Talent Pool**

*Version 1.0 — April 2026*

---

## What is People in Tech?

People in Tech is a discovery platform that connects tech talent with employers across Greece. Companies get a curated profile showcasing their team, open roles, and events. Candidates build a professional profile, follow companies, and express interest in opportunities — all in one place.

The platform is built for the Greek tech ecosystem: startups, scale-ups, and established companies hiring in Athens, Thessaloniki, and remote.

---

## Platform Overview

### For Candidates

- **Discover** companies by industry, location, size, and tech stack
- **Follow** companies to stay updated on new roles and events
- **Express interest** in jobs so companies can view your profile
- **Build a profile** with skills, experience, education, and preferences
- **Get alerts** when followed companies post new roles or events

### For Companies

- **Claim your company page** to verify your profile
- **Showcase your team**, tech stack, and culture
- **Post jobs and events** that reach the talent pool
- **See interested candidates** and view their profiles

### For Admins

- **Manage all companies** — edit profiles, assign representatives, toggle featured/VC-funded badges
- **Review claims and listing requests** from companies
- **Scrape and import jobs** from company career pages
- **Manage events, partners, content, and newsletters**
- **View candidate profiles** with contact email for outreach
- **Export candidate data** to CSV

---

## 1. Getting Started

### Creating an Account

1. Visit the homepage and click **"Get Started"**
2. Enter your **full name**, **email**, and **password**
3. Check your inbox for a **verification email** — click the link to verify
4. Complete the **onboarding wizard** (3 steps):

| Step | What You Fill In |
|------|-----------------|
| **About You** | Name, headline, experience level, LinkedIn URL |
| **Interests** | Role interests (max 5), skills, industries, preferred locations |
| **Preferences** | Email notifications (weekly digest, events, newsletter) |

5. You're in — you land on the **Discover** page

### Signing In

- Go to `/login` and enter your email + password
- Forgot your password? Click the link — a reset email is sent within seconds

---

## 2. Discovering Companies

**Page:** Discover

The Discover page is the main hub for browsing companies on the platform.

### Search & Filters

| Filter | What It Does |
|--------|-------------|
| **Search** | Find companies by name |
| **Industry** | Filter by sector (FinTech, SaaS, HealthTech, etc.) |
| **Location** | Filter by city (Athens, Thessaloniki, Remote, etc.) |
| **Size** | Filter by team size |
| **Has Open Roles** | Show only companies with active job listings |
| **Verified** | Show only verified companies |
| **VC Funded** | Show only VC-backed companies |

### Sort Options

- **Most Followed** (default) — popular companies first
- **Newest** — recently added companies first
- **Alphabetical** — A to Z
- **Most Open Roles** — companies hiring the most

### Company Cards

Each card shows:
- Company logo and name
- Industry and location
- Follower count and open roles count
- **Featured** badge (green star) — hand-picked by admin
- **VC Funded** badge (blue) — venture-backed companies
- **Verified** checkmark — company has a confirmed representative

---

## 3. Company Profiles

Click any company card to view their full profile. Each profile has:

### Hero Section
- Cover image and logo
- Company name with verification badge
- Industry, location, size, founded year
- **Follow** button (tracks your interest)
- Website and LinkedIn links
- Representative info (name, title, LinkedIn) for verified companies

### Tabs

| Tab | Content |
|-----|---------|
| **About** | Full description, technologies, team members |
| **Open Roles** | Active job listings with links to apply |
| **Events** | Upcoming events hosted by this company |
| **Gallery** | Photos showcasing the company culture |

### Claiming a Company

If you represent a company on the platform, you can claim it:

1. Click **"Claim this company"** on the profile page
2. Fill in: your name, job title, work email, LinkedIn (optional), message (optional)
3. **If logged in:** Your claim is submitted for admin review immediately
4. **If not logged in:** A verification email is sent to your work email — click the link, then your claim goes to admin review
5. Admin approves or rejects the claim

> **Note:** Multiple people can submit claims for the same company. The admin reviews all claims and decides who to approve.

---

## 4. Jobs

### Job Listings Page

Browse all active jobs with:
- **Search** by title or company name
- **Filter** by job type (Remote, Hybrid, On-site)
- **Sort** by newest, oldest, company name, or location

Each job card shows: title, company, location, type, and when it was posted.

> Anonymous visitors can see the first 6 jobs. Sign up to browse all listings.

### Job Detail Page

Click a job to see:
- Full description, requirements, and tech stack
- Experience level
- **"Apply"** button — links directly to the company's application page
- **"Express Interest"** button — signals to the company that you're interested (they can then view your profile)
- **"Save Job"** button — adds to your dashboard
- More roles from the same company

---

## 5. Events

Browse upcoming and past tech events:
- Workshops, meetups, webinars, and more
- Filter by event type, date range, and online/in-person
- **Save** events to your dashboard
- **Register** for events directly

---

## 6. Candidate Dashboard

Your personal hub after signing in. Access it from the user menu → **Dashboard**.

### Stats Bar
Four cards showing: Saved Companies, Saved Jobs, New Alerts, Saved Events

### Tabs

| Tab | What's Here |
|-----|-------------|
| **Saved Companies** | Companies you follow — unfollow from here |
| **Saved Jobs** | Jobs you've bookmarked — unsave from here |
| **Alerts** | New jobs and events from companies you follow (30-day window) |
| **Saved Events** | Events you've saved or registered for |

---

## 7. Your Profile

### Editing Your Profile

Go to **Dashboard → Edit Profile** to manage:

| Section | Fields |
|---------|--------|
| **About** | Name, bio, public title, LinkedIn, website, avatar |
| **Availability** | Status (open to work, not looking, open to freelance), preferred work type, salary expectation |
| **Skills & Interests** | Skills, role interests, industries, preferred locations |
| **Experience** | Work history (company, role, dates, description) |
| **Education** | Degrees (institution, degree, field, years) |
| **Certifications** | Professional certifications (name, issuer, year) |
| **Languages** | Spoken languages with proficiency level |
| **CV** | Upload your resume |
| **Visibility** | Toggle profile public/private |

A **completeness meter** on the right shows your progress and what's missing.

### Public Profile

When your profile is public, verified company representatives (whose jobs you've expressed interest in) and admins can view:
- Your name, title, bio, and availability
- Skills, industries, and role interests
- Work experience and education
- Certifications and languages
- Links (LinkedIn, GitHub, portfolio, website, CV)

---

## 8. Listing a New Company

If your company isn't on the platform yet:

1. Go to **"List Your Company"** (linked from the homepage or footer)
2. Fill in: company name, website, contact email, phone (optional), your role, message (optional)
3. Submit — the request goes to admin for review
4. If the company already exists, you'll see a warning with a link to claim it instead

---

## 9. Admin Guide

The admin panel is accessible at `/admin` for users with the Admin role.

### Dashboard Overview

- **KPIs:** Total companies, total candidates, pending claims, active jobs
- **Pending claims alert** with quick link to review
- **Top companies** by follower count
- **Signup trends** chart (30 days)

### Companies Management

| Action | How |
|--------|-----|
| **Add company** | Click "Add Company" — enter name, industry, website, description |
| **Edit company** | Click the pencil icon → slide-out panel with all fields |
| **Enrich from website** | Click sparkle icon → auto-extracts description, logo, LinkedIn, technologies |
| **Scrape jobs** | Click scan icon → finds jobs from the company's careers page |
| **Toggle Featured** | In edit panel → "Featured" switch → shows green star badge |
| **Toggle VC Funded** | In edit panel → "VC Funded" switch → shows blue badge |
| **Assign Representative** | In edit panel → "Representative" section → enter name, title, email, LinkedIn |
| **Delete company** | Click trash icon (permanent) |

### Claims Queue

Three sections in one view:

| Section | What It Shows | Actions |
|---------|--------------|---------|
| **Listing Requests** | Companies submitted via "List my company" form | Approve (sets to active) / Reject (deletes) |
| **Company Claims** | Ownership claims from logged-in users | Approve (verifies company + promotes user) / Reject (requires reason) |
| **Pending Verifications** | Public claims awaiting email verification | Dismiss |

### Job Management

- View all jobs with interest counts
- Click the interest badge to see which candidates expressed interest (links to their profiles)
- Toggle job status (Active/Paused)
- Delete jobs

### Candidates

- Search by name or email
- View any candidate's profile (including private profiles)
- Candidate email is visible on their profile page (admin only)
- **Export to CSV** for outreach

### Other Admin Features

| Feature | What It Does |
|---------|-------------|
| **Events** | Create, edit, delete platform events |
| **Partners** | Manage partner logos shown on homepage |
| **Content (CMS)** | Edit homepage text, hero, footer (per language) |
| **Newsletter** | Create and send newsletters to subscribers |
| **Analytics** | View platform-wide stats and trends |

---

## 10. Email Notifications

The platform sends the following emails:

| Email | When | To Whom |
|-------|------|---------|
| Welcome | After registration | New user |
| Email Verification | After registration / on request | User |
| Password Reset | When requested | User |
| Claim Submitted | After submitting a claim | Claimant |
| Claim Approved | Admin approves claim | Claimant |
| Claim Rejected | Admin rejects claim | Claimant |
| Admin Alert | New claim or listing request | All admins |
| Weekly Digest | Weekly (if new content) | Opted-in users |
| Event Announcement | New event created | Opted-in users |
| Newsletter | Admin sends | All subscribers |

Users can unsubscribe from any email type via the link in every email.

---

## 11. Testing Checklist

Use this checklist to verify the platform is working correctly:

### Public Pages
- [ ] Homepage loads with companies, jobs, events sections
- [ ] Discover page loads with company cards
- [ ] Search and filters work on Discover
- [ ] VC Funded and Featured badges show on cards
- [ ] Company profile page loads with all tabs
- [ ] Jobs page loads and filters work
- [ ] Events page loads with upcoming/past events
- [ ] "List Your Company" form submits successfully
- [ ] Duplicate company name shows warning instead of creating duplicate

### Authentication
- [ ] Register → receive verification email → verify → onboarding
- [ ] Login with email/password
- [ ] Forgot password → reset email → set new password
- [ ] Logout works

### Candidate Features
- [ ] Onboarding wizard completes all 3 steps
- [ ] Dashboard shows saved companies, jobs, alerts, events
- [ ] Follow/unfollow companies
- [ ] Save/unsave jobs and events
- [ ] Express interest on a job detail page
- [ ] Profile editor saves all sections
- [ ] Profile completeness meter updates
- [ ] Public profile shows correctly (when viewed by admin)

### Company Claims
- [ ] Claim modal opens on company page
- [ ] Logged-in claim submits and shows "Claim Pending"
- [ ] Logged-out claim sends verification email
- [ ] Claim appears in admin Claims Queue
- [ ] Admin can approve/reject claims

### Admin
- [ ] Dashboard KPIs are accurate
- [ ] Companies table: add, edit, delete, enrich, scrape jobs
- [ ] Representative section in edit sheet: add, save, remove
- [ ] Claims queue: approve/reject claims, approve/reject listing requests, dismiss pending
- [ ] Jobs table: view interested candidates, toggle status
- [ ] Candidates table: search, view profiles, see email, export CSV
- [ ] Events: create, edit, delete
- [ ] Partners: add, reorder, toggle active
- [ ] Content CMS: edit and save per language
- [ ] Newsletter: create and send

---

## Quick Reference

| Page | URL | Who Can Access |
|------|-----|---------------|
| Homepage | `/` | Everyone |
| Discover | `/discover` | Everyone (auth gate after 10 results) |
| Company Profile | `/companies/[slug]` | Everyone |
| Jobs | `/jobs` | Everyone (auth gate after 6 results) |
| Job Detail | `/jobs/[id]` | Everyone |
| Events | `/events` | Everyone |
| Register | `/register` | Anonymous |
| Login | `/login` | Anonymous |
| Onboarding | `/onboarding` | New users |
| Dashboard | `/dashboard` | Logged-in users |
| Profile Editor | `/dashboard/profile` | Logged-in users |
| Public Profile | `/profile/[id]` | Admin, Company Reps (with interest) |
| List Company | `/list-company` | Everyone |
| Admin Panel | `/admin` | Admin only |

---

*People in Tech — Connecting Greece's tech talent with the companies building the future.*

*Powered by POS4work / Venture Friends*
