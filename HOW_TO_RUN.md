# Hiring Partners MVP — How to Run

## Live Instance

The app is currently running at: **http://100.99.60.38:3000**

It will redirect to `/en` (English) by default. Switch to Greek via the language switcher (globe icon in the navbar).

## Demo Users

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | `admin@pos4work.gr` | `admin123` | Full admin dashboard at `/admin` |
| Candidate | `demo@candidate.gr` | `demo123` | Candidate dashboard, follow companies, save jobs |

You can also register a new account via `/register`.

## Running Locally

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd /home/ubuntu/people_in_tech

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (20 Greek tech companies, sample jobs, events)
npx prisma db seed

# Start development server
npm run dev
```

The dev server starts at `http://localhost:3000`.

### Production Build

```bash
npm run build
npx next start -H 0.0.0.0 -p 3000
```

Use `-H 0.0.0.0` to make it accessible on all network interfaces (including Tailscale).

### Environment Variables

The `.env` file contains:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://100.99.60.38:3000"
```

Change `NEXTAUTH_URL` to match your host if running elsewhere.

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/en` | Hero, featured companies, stats, events |
| Discover | `/en/discover` | Browse and filter all 20 companies |
| Jobs | `/en/jobs` | All active job listings with filters |
| Events | `/en/events` | Community events with registration |
| Company Profile | `/en/companies/workable` | Example company page with tabs |
| Login | `/en/login` | Sign in |
| Register | `/en/register` | Create account |
| Onboarding | `/en/onboarding` | 3-step wizard (after registration) |
| Candidate Dashboard | `/en/dashboard/candidate` | Following, saved jobs, settings |
| Company Dashboard | `/en/dashboard/company` | Profile editor, jobs, events, analytics |
| Admin Dashboard | `/en/admin` | Platform management |

All pages also work with `/el` prefix for Greek.

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma v7** + **SQLite**
- **NextAuth v4** (email/password)
- **next-intl** (English + Greek)
- **Recharts** (analytics charts)

## Seeded Data

- 20 real Greek tech companies (Workable, Viva Wallet, Blueground, Skroutz, etc.)
- 18 job listings across companies
- 5 community events
- 2 user accounts (admin + demo candidate)
