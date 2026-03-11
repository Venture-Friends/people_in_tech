# Hiring Partners — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full functional MVP of an employer discovery platform for the Greek tech ecosystem with dark HTB-inspired theme, 20 real company profiles, candidate onboarding, follow system, job alerts, events, claim flow, and admin dashboard.

**Architecture:** Monolithic Next.js 14+ App Router with Server + Client Components. Prisma ORM over SQLite (local dev, swap to Postgres later). NextAuth for email/password auth. next-intl for i18n (EN/EL). shadcn/ui for component library.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4, shadcn/ui, Prisma, SQLite, NextAuth.js, next-intl, react-hook-form, zod, recharts, bcryptjs

**Reference:** Design doc at `docs/plans/2026-03-11-hiring-partners-design.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/utils.ts`, `components.json`

**Step 1: Create Next.js project**

```bash
cd /home/ubuntu/people_in_tech
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Project scaffolded with App Router, TypeScript, Tailwind CSS.

**Step 2: Install core dependencies**

```bash
npm install next-intl @prisma/client next-auth@4 bcryptjs zod react-hook-form @hookform/resolvers recharts date-fns clsx tailwind-merge lucide-react
npm install -D prisma @types/bcryptjs
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Choose: TypeScript: yes, style: Default, base color: Slate, global CSS: src/app/globals.css, CSS variables: yes, tailwind.config: tailwind.config.ts, components: @/components/ui, utils: @/lib/utils, RSC: yes.

**Step 4: Add shadcn/ui components**

```bash
npx shadcn@latest add button card input badge dialog tabs select avatar toast skeleton sheet dropdown-menu command form progress separator table tooltip switch textarea label
```

**Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Dev server on http://localhost:3000, default Next.js page renders.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with shadcn/ui and core dependencies"
```

---

## Task 2: Dark Theme Design System

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Configure Tailwind with custom theme**

Replace `tailwind.config.ts` with the HTB-inspired dark theme:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        foreground: "#f4f4f5",
        card: {
          DEFAULT: "#111827",
          foreground: "#f4f4f5",
        },
        popover: {
          DEFAULT: "#1a2332",
          foreground: "#f4f4f5",
        },
        primary: {
          DEFAULT: "#9fef00",
          foreground: "#0a0e1a",
        },
        secondary: {
          DEFAULT: "#14b8a6",
          foreground: "#f4f4f5",
        },
        muted: {
          DEFAULT: "#1e2939",
          foreground: "#8799b5",
        },
        accent: {
          DEFAULT: "#1a2332",
          foreground: "#f4f4f5",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f4f4f5",
        },
        border: "#1e293b",
        input: "#1e2939",
        ring: "#9fef00",
        success: "#22c55e",
        warning: "#eab308",
        info: "#3b82f6",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(159, 239, 0, 0.08)",
        "glow-lg": "0 0 40px rgba(159, 239, 0, 0.12)",
      },
      keyframes: {
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

**Step 2: Set up global CSS**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 228 45% 7%;
    --foreground: 240 5% 96%;
    --card: 222 33% 11%;
    --card-foreground: 240 5% 96%;
    --popover: 215 29% 16%;
    --popover-foreground: 240 5% 96%;
    --primary: 82 100% 47%;
    --primary-foreground: 228 45% 7%;
    --secondary: 173 72% 40%;
    --secondary-foreground: 240 5% 96%;
    --muted: 215 29% 17%;
    --muted-foreground: 214 21% 52%;
    --accent: 215 29% 16%;
    --accent-foreground: 240 5% 96%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 240 5% 96%;
    --border: 217 33% 17%;
    --input: 215 29% 17%;
    --ring: 82 100% 47%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Dot grid background pattern */
.bg-dot-grid {
  background-image: radial-gradient(circle, #1e293b 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Skeleton shimmer */
.skeleton-shimmer {
  background: linear-gradient(90deg, #111827 25%, #1a2332 50%, #111827 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Glow hover effect for cards */
.card-glow:hover {
  box-shadow: 0 0 20px rgba(159, 239, 0, 0.08);
  border-color: rgba(159, 239, 0, 0.2);
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0a0e1a;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2d3a4d;
}
```

**Step 3: Set up fonts**

Create `src/lib/fonts.ts`:

```ts
import { Inter, JetBrains_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
```

**Step 4: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring Partners — Discover Greek Tech Companies",
  description:
    "Follow innovative companies and startups in the Greek tech ecosystem. Get job alerts, attend events, join the community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Step 5: Verify dark theme renders**

```bash
npm run dev
```

Visit http://localhost:3000. Expected: Dark background (#0a0e1a), light text.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: configure dark HTB-inspired design system with custom Tailwind theme"
```

---

## Task 3: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `.env`
- Create: `.env.example`
- Modify: `.gitignore`

**Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 2: Write the full Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          String    @default("CANDIDATE") // CANDIDATE | COMPANY_REP | ADMIN
  locale        String    @default("en") // en | el
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  candidateProfile   CandidateProfile?
  follows            Follow[]
  savedJobs          SavedJob[]
  eventRegistrations EventRegistration[]
  companyClaims      CompanyClaim[]
  reviewedClaims     CompanyClaim[]      @relation("ReviewedBy")
  newsletters        Newsletter[]

  @@map("users")
}

model CandidateProfile {
  id                 String  @id @default(cuid())
  userId             String  @unique
  headline           String?
  experienceLevel    String  @default("STUDENT") // STUDENT | GRADUATE | JUNIOR
  linkedinUrl        String?
  skills             String  @default("[]") // JSON array (SQLite has no native arrays)
  roleInterests      String  @default("[]") // JSON array
  industries         String  @default("[]") // JSON array
  preferredLocations String  @default("[]") // JSON array
  emailDigest        Boolean @default(true)
  emailEvents        Boolean @default(true)
  emailNewsletter    Boolean @default(false)
  onboardingComplete Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("candidate_profiles")
}

model Company {
  id           String   @id @default(cuid())
  slug         String   @unique
  name         String
  description  String?
  industry     String
  website      String?
  linkedinUrl  String?
  logo         String?
  coverImage   String?
  size         String   @default("SMALL") // TINY | SMALL | MEDIUM | LARGE
  founded      Int?
  locations    String   @default("[]") // JSON array
  technologies String   @default("[]") // JSON array
  status       String   @default("AUTO_GENERATED") // AUTO_GENERATED | CLAIMED | VERIFIED
  featured     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  jobs     JobListing[]
  events   Event[]
  followers Follow[]
  claims   CompanyClaim[]
  gallery  GalleryImage[]

  @@map("companies")
}

model CompanyClaim {
  id          String    @id @default(cuid())
  companyId   String
  userId      String
  fullName    String
  jobTitle    String
  workEmail   String
  linkedinUrl String?
  message     String?
  status      String    @default("PENDING") // PENDING | APPROVED | REJECTED
  reviewedBy  String?
  reviewNote  String?
  createdAt   DateTime  @default(now())
  reviewedAt  DateTime?

  company  Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviewer User?   @relation("ReviewedBy", fields: [reviewedBy], references: [id])

  @@map("company_claims")
}

model JobListing {
  id          String    @id @default(cuid())
  companyId   String
  title       String
  location    String?
  type        String    @default("ONSITE") // REMOTE | HYBRID | ONSITE
  externalUrl String
  status      String    @default("ACTIVE") // ACTIVE | PAUSED | EXPIRED
  postedAt    DateTime  @default(now())
  expiresAt   DateTime?

  company   Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)
  savedBy   SavedJob[]

  @@map("job_listings")
}

model Event {
  id              String    @id @default(cuid())
  companyId       String?
  title           String
  description     String?
  type            String    @default("WORKSHOP") // WORKSHOP | MEETUP | WEBINAR | TALENT_SESSION
  date            DateTime
  startTime       String
  endTime         String?
  location        String?
  isOnline        Boolean   @default(false)
  registrationUrl String?
  capacity        Int?
  createdAt       DateTime  @default(now())

  company       Company?            @relation(fields: [companyId], references: [id], onDelete: SetNull)
  registrations EventRegistration[]

  @@map("events")
}

model Follow {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@unique([userId, companyId])
  @@map("follows")
}

model SavedJob {
  id           String   @id @default(cuid())
  userId       String
  jobListingId String
  savedAt      DateTime @default(now())

  user User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  job  JobListing @relation(fields: [jobListingId], references: [id], onDelete: Cascade)

  @@unique([userId, jobListingId])
  @@map("saved_jobs")
}

model EventRegistration {
  id           String   @id @default(cuid())
  userId       String
  eventId      String
  registeredAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@map("event_registrations")
}

model GalleryImage {
  id        String  @id @default(cuid())
  companyId String
  url       String
  caption   String?
  order     Int     @default(0)

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("gallery_images")
}

model Newsletter {
  id             String    @id @default(cuid())
  subject        String
  content        String
  status         String    @default("DRAFT") // DRAFT | SENT
  sentAt         DateTime?
  recipientCount Int?
  createdBy      String
  createdAt      DateTime  @default(now())

  creator User @relation(fields: [createdBy], references: [id])

  @@map("newsletters")
}
```

**Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 4: Set up env files**

`.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

`.env.example`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-a-real-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Add to `.gitignore`: `*.db`, `*.db-journal`, `.env`

**Step 5: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created, `dev.db` file created in `prisma/` directory.

**Step 6: Verify Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens browser at http://localhost:5555 showing all tables.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema with all models and initial migration"
```

---

## Task 4: Seed Data — 20 Greek Tech Companies

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed script)

**Step 1: Create seed file with 20 real Greek tech companies**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pos4work.gr" },
    update: {},
    create: {
      email: "admin@pos4work.gr",
      name: "POS4work Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  // Create demo candidate
  const candidatePassword = await hash("demo123", 12);
  const candidate = await prisma.user.upsert({
    where: { email: "demo@candidate.gr" },
    update: {},
    create: {
      email: "demo@candidate.gr",
      name: "Maria Papadopoulou",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      emailVerified: true,
      candidateProfile: {
        create: {
          headline: "Computer Science Student at AUEB",
          experienceLevel: "STUDENT",
          skills: JSON.stringify(["React", "TypeScript", "Python", "Node.js"]),
          roleInterests: JSON.stringify(["Frontend", "Full-Stack"]),
          industries: JSON.stringify(["FinTech", "SaaS"]),
          preferredLocations: JSON.stringify(["Athens", "Remote"]),
          onboardingComplete: true,
        },
      },
    },
  });

  // 20 real Greek tech companies
  const companies = [
    {
      slug: "workable",
      name: "Workable",
      description: "Workable is the world's leading hiring platform. They provide AI-powered sourcing tools, a comprehensive applicant tracking system, and hiring solutions used by thousands of companies worldwide. Founded in Athens, they've grown to become one of Greece's most successful tech exports.",
      industry: "HR Tech",
      website: "https://www.workable.com",
      linkedinUrl: "https://www.linkedin.com/company/workable",
      logo: "/logos/workable.svg",
      size: "MEDIUM",
      founded: 2012,
      locations: JSON.stringify(["Athens", "London", "Remote"]),
      technologies: JSON.stringify(["React", "Ruby on Rails", "Python", "AWS", "Kubernetes"]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "viva-wallet",
      name: "Viva Wallet",
      description: "Viva Wallet is a European cloud-based neobank and payment institution, offering a wide range of digital payment solutions. Headquartered in Athens, they operate across 24 European countries and are transforming the way businesses accept payments.",
      industry: "FinTech",
      website: "https://www.vivawallet.com",
      linkedinUrl: "https://www.linkedin.com/company/vivawallet",
      logo: "/logos/vivawallet.svg",
      size: "LARGE",
      founded: 2010,
      locations: JSON.stringify(["Athens", "London", "Brussels", "Remote"]),
      technologies: JSON.stringify(["Java", "Spring Boot", "React", "Kubernetes", "Azure"]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "blueground",
      name: "Blueground",
      description: "Blueground furnishes and manages apartments in the world's most desirable neighborhoods, offering flexible living for professionals on the move. A Greek proptech unicorn, they combine technology with hospitality to redefine urban living.",
      industry: "PropTech",
      website: "https://www.theblueground.com",
      linkedinUrl: "https://www.linkedin.com/company/blueground",
      logo: "/logos/blueground.svg",
      size: "MEDIUM",
      founded: 2013,
      locations: JSON.stringify(["Athens", "New York", "Dubai", "Remote"]),
      technologies: JSON.stringify(["Python", "Django", "React", "AWS", "PostgreSQL"]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "skroutz",
      name: "Skroutz",
      description: "Skroutz is Greece's leading marketplace and price comparison platform. With millions of products and thousands of merchants, they power online commerce across Greece with cutting-edge technology and logistics infrastructure.",
      industry: "E-commerce",
      website: "https://www.skroutz.gr",
      linkedinUrl: "https://www.linkedin.com/company/skroutz",
      logo: "/logos/skroutz.svg",
      size: "LARGE",
      founded: 2005,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify(["Ruby on Rails", "Go", "React", "Elasticsearch", "Redis"]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "epignosis",
      name: "Epignosis",
      description: "Epignosis is the company behind TalentLMS, one of the world's most popular learning management systems. They build intuitive eLearning solutions that help organizations train employees, partners, and customers at scale.",
      industry: "EdTech",
      website: "https://www.epignosishq.com",
      linkedinUrl: "https://www.linkedin.com/company/epignosis",
      logo: "/logos/epignosis.svg",
      size: "MEDIUM",
      founded: 2012,
      locations: JSON.stringify(["Athens", "San Francisco", "Remote"]),
      technologies: JSON.stringify(["PHP", "Laravel", "Vue.js", "MySQL", "AWS"]),
      status: "VERIFIED",
      featured: false,
    },
    {
      slug: "beat",
      name: "Beat",
      description: "Beat (formerly Taxibeat) is a ride-hailing app that connects passengers with taxi drivers. Acquired by FreeNow (Daimler & BMW), Beat remains a key player in mobility technology with strong Greek engineering roots.",
      industry: "Mobility",
      website: "https://thebeat.co",
      linkedinUrl: "https://www.linkedin.com/company/beat",
      logo: "/logos/beat.svg",
      size: "MEDIUM",
      founded: 2011,
      locations: JSON.stringify(["Athens", "Lima", "Bogota"]),
      technologies: JSON.stringify(["Kotlin", "Swift", "Go", "React Native", "GCP"]),
      status: "VERIFIED",
      featured: false,
    },
    {
      slug: "plum-fintech",
      name: "Plum",
      description: "Plum is an AI-powered money management app that helps users save, invest, and manage their money automatically. Founded by Greek entrepreneurs, Plum uses smart algorithms to analyze spending and set money aside.",
      industry: "FinTech",
      website: "https://withplum.com",
      linkedinUrl: "https://www.linkedin.com/company/withplum",
      logo: "/logos/plum.svg",
      size: "MEDIUM",
      founded: 2016,
      locations: JSON.stringify(["Athens", "London", "Remote"]),
      technologies: JSON.stringify(["Python", "React Native", "Node.js", "AWS", "Machine Learning"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "upstream",
      name: "Upstream",
      description: "Upstream is a mobile technology company that provides mobile marketing and commerce platforms to telecom operators worldwide. Their Grow platform helps mobile operators and brands engage with users through intelligent messaging.",
      industry: "Mobile Tech",
      website: "https://www.upstreamsystems.com",
      linkedinUrl: "https://www.linkedin.com/company/upstream-systems",
      logo: "/logos/upstream.svg",
      size: "MEDIUM",
      founded: 2001,
      locations: JSON.stringify(["Athens", "London", "Sao Paulo"]),
      technologies: JSON.stringify(["Java", "Python", "Big Data", "Machine Learning", "AWS"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "persado",
      name: "Persado",
      description: "Persado uses AI and computational linguistics to generate the language that motivates people to act. Their Motivation AI platform helps brands create the most effective marketing messages across every channel.",
      industry: "AI / MarTech",
      website: "https://www.persado.com",
      linkedinUrl: "https://www.linkedin.com/company/persado",
      logo: "/logos/persado.svg",
      size: "MEDIUM",
      founded: 2012,
      locations: JSON.stringify(["Athens", "New York", "Remote"]),
      technologies: JSON.stringify(["Python", "NLP", "Machine Learning", "React", "AWS"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "softomotive",
      name: "Softomotive",
      description: "Softomotive (acquired by Microsoft) is a robotic process automation (RPA) company that created WinAutomation and ProcessRobot. Their technology now powers Microsoft Power Automate Desktop, used by millions worldwide.",
      industry: "RPA / Enterprise",
      website: "https://www.microsoft.com/en-us/power-platform/products/power-automate",
      linkedinUrl: "https://www.linkedin.com/company/softomotive",
      logo: "/logos/softomotive.svg",
      size: "MEDIUM",
      founded: 2005,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([".NET", "C#", "Azure", "AI", "Automation"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "accusonus",
      name: "Accusonus (Meta)",
      description: "Accusonus developed AI-powered audio processing tools for creators and professionals. Acquired by Meta in 2022, their team now works on audio AI for Meta's platforms including Instagram and Reality Labs.",
      industry: "AI / Audio",
      website: "https://about.meta.com",
      linkedinUrl: "https://www.linkedin.com/company/accusonus",
      logo: "/logos/accusonus.svg",
      size: "SMALL",
      founded: 2013,
      locations: JSON.stringify(["Patras", "Athens"]),
      technologies: JSON.stringify(["Python", "C++", "Deep Learning", "Audio DSP", "PyTorch"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "intelligencia-ai",
      name: "Intelligencia AI",
      description: "Intelligencia AI uses artificial intelligence to predict clinical trial outcomes and accelerate drug development. Their platform helps pharmaceutical companies make data-driven decisions about clinical programs.",
      industry: "HealthTech / AI",
      website: "https://www.intelligencia.ai",
      linkedinUrl: "https://www.linkedin.com/company/intelligencia-ai",
      logo: "/logos/intelligencia.svg",
      size: "SMALL",
      founded: 2019,
      locations: JSON.stringify(["Athens", "Boston", "Remote"]),
      technologies: JSON.stringify(["Python", "Machine Learning", "React", "FastAPI", "AWS"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "hack-the-box",
      name: "Hack The Box",
      description: "Hack The Box is a massive online cybersecurity training platform. They provide hands-on labs, CTF challenges, and certification paths for security professionals. A major Greek tech success story with a global community.",
      industry: "Cybersecurity",
      website: "https://www.hackthebox.com",
      linkedinUrl: "https://www.linkedin.com/company/hackthebox",
      logo: "/logos/hackthebox.svg",
      size: "MEDIUM",
      founded: 2017,
      locations: JSON.stringify(["Athens", "London", "Remote"]),
      technologies: JSON.stringify(["Go", "Vue.js", "Docker", "Kubernetes", "AWS"]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "warply",
      name: "Warply",
      description: "Warply provides a customer engagement and loyalty platform for enterprises. Their mobile-first technology helps brands build deeper relationships with customers through personalized experiences and rewards programs.",
      industry: "MarTech",
      website: "https://www.warply.com",
      linkedinUrl: "https://www.linkedin.com/company/warply",
      logo: "/logos/warply.svg",
      size: "SMALL",
      founded: 2013,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify(["Swift", "Kotlin", "Node.js", "React", "MongoDB"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "pollfish",
      name: "Pollfish",
      description: "Pollfish (acquired by Prodege) is a mobile survey platform that delivers surveys through apps. Their technology reaches millions of respondents worldwide, enabling real-time market research at scale.",
      industry: "MarTech / Research",
      website: "https://www.pollfish.com",
      linkedinUrl: "https://www.linkedin.com/company/pollfish",
      logo: "/logos/pollfish.svg",
      size: "SMALL",
      founded: 2013,
      locations: JSON.stringify(["Athens", "New York"]),
      technologies: JSON.stringify(["Java", "Python", "Android SDK", "iOS SDK", "GCP"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "netdata",
      name: "Netdata",
      description: "Netdata is an open-source infrastructure monitoring platform. Their real-time monitoring agent runs on millions of servers worldwide, collecting thousands of metrics per second with zero configuration.",
      industry: "DevOps / Monitoring",
      website: "https://www.netdata.cloud",
      linkedinUrl: "https://www.linkedin.com/company/netdata-cloud",
      logo: "/logos/netdata.svg",
      size: "MEDIUM",
      founded: 2016,
      locations: JSON.stringify(["Athens", "Remote"]),
      technologies: JSON.stringify(["C", "Go", "React", "Kubernetes", "Open Source"]),
      status: "VERIFIED",
      featured: false,
    },
    {
      slug: "welcome-pickups",
      name: "Welcome Pickups",
      description: "Welcome Pickups is a travel tech company that provides personalized airport transfer and destination experiences. They partner with hotels and travel brands to enhance the guest experience from arrival to departure.",
      industry: "TravelTech",
      website: "https://www.welcomepickups.com",
      linkedinUrl: "https://www.linkedin.com/company/welcomepickups",
      logo: "/logos/welcomepickups.svg",
      size: "SMALL",
      founded: 2015,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify(["React", "Node.js", "Python", "PostgreSQL", "AWS"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "athlenda",
      name: "Athlenda",
      description: "Athlenda is a sports technology startup building AI-powered performance analytics for athletes and teams. They combine computer vision and machine learning to provide real-time insights during training and competition.",
      industry: "SportsTech / AI",
      website: "https://www.athlenda.com",
      linkedinUrl: "https://www.linkedin.com/company/athlenda",
      logo: "/logos/athlenda.svg",
      size: "TINY",
      founded: 2021,
      locations: JSON.stringify(["Athens", "Remote"]),
      technologies: JSON.stringify(["Python", "Computer Vision", "React", "TensorFlow", "AWS"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "instashop",
      name: "InstaShop",
      description: "InstaShop (acquired by Delivery Hero) is an online grocery marketplace connecting customers with local supermarkets and specialty stores. A Greek-founded startup that grew to operate across the Middle East and Europe.",
      industry: "E-commerce / Delivery",
      website: "https://www.instashop.com",
      linkedinUrl: "https://www.linkedin.com/company/instashop",
      logo: "/logos/instashop.svg",
      size: "MEDIUM",
      founded: 2015,
      locations: JSON.stringify(["Athens", "Dubai"]),
      technologies: JSON.stringify(["React Native", "Node.js", "Python", "PostgreSQL", "GCP"]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "stoiximan",
      name: "Stoiximan / Betano",
      description: "Stoiximan (Betano internationally) is a leading online gaming and entertainment company. With strong technology and data science teams in Athens, they power one of Europe's fastest-growing betting platforms.",
      industry: "Gaming / Entertainment",
      website: "https://www.stoiximan.gr",
      linkedinUrl: "https://www.linkedin.com/company/stoiximan",
      logo: "/logos/stoiximan.svg",
      size: "LARGE",
      founded: 2012,
      locations: JSON.stringify(["Athens", "Thessaloniki"]),
      technologies: JSON.stringify(["Java", "React", "Data Science", "Kafka", "Kubernetes"]),
      status: "VERIFIED",
      featured: true,
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: company,
    });
  }

  // Sample job listings (2-3 per featured company)
  const jobListings = [
    { companySlug: "workable", title: "Senior Frontend Engineer", location: "Athens", type: "HYBRID", externalUrl: "https://apply.workable.com/workable/" },
    { companySlug: "workable", title: "Backend Developer (Ruby)", location: "Remote", type: "REMOTE", externalUrl: "https://apply.workable.com/workable/" },
    { companySlug: "viva-wallet", title: "Java Software Engineer", location: "Athens", type: "ONSITE", externalUrl: "https://www.vivawallet.com/careers" },
    { companySlug: "viva-wallet", title: "React Frontend Developer", location: "Athens", type: "HYBRID", externalUrl: "https://www.vivawallet.com/careers" },
    { companySlug: "viva-wallet", title: "DevOps Engineer", location: "Remote", type: "REMOTE", externalUrl: "https://www.vivawallet.com/careers" },
    { companySlug: "blueground", title: "Full-Stack Developer", location: "Athens", type: "HYBRID", externalUrl: "https://www.theblueground.com/careers" },
    { companySlug: "blueground", title: "Data Analyst", location: "Athens", type: "ONSITE", externalUrl: "https://www.theblueground.com/careers" },
    { companySlug: "skroutz", title: "Ruby on Rails Developer", location: "Athens", type: "ONSITE", externalUrl: "https://www.skroutz.gr/careers" },
    { companySlug: "skroutz", title: "Go Backend Engineer", location: "Athens", type: "HYBRID", externalUrl: "https://www.skroutz.gr/careers" },
    { companySlug: "skroutz", title: "Frontend Engineer (React)", location: "Athens", type: "HYBRID", externalUrl: "https://www.skroutz.gr/careers" },
    { companySlug: "hack-the-box", title: "Security Engineer", location: "Remote", type: "REMOTE", externalUrl: "https://www.hackthebox.com/careers" },
    { companySlug: "hack-the-box", title: "Vue.js Frontend Developer", location: "Athens", type: "HYBRID", externalUrl: "https://www.hackthebox.com/careers" },
    { companySlug: "stoiximan", title: "Machine Learning Engineer", location: "Athens", type: "ONSITE", externalUrl: "https://www.stoiximan.gr/careers" },
    { companySlug: "stoiximan", title: "React Developer", location: "Thessaloniki", type: "ONSITE", externalUrl: "https://www.stoiximan.gr/careers" },
    { companySlug: "epignosis", title: "PHP/Laravel Developer", location: "Athens", type: "HYBRID", externalUrl: "https://www.epignosishq.com/careers" },
    { companySlug: "netdata", title: "C Developer (Open Source)", location: "Remote", type: "REMOTE", externalUrl: "https://www.netdata.cloud/careers" },
    { companySlug: "plum-fintech", title: "React Native Developer", location: "Athens", type: "HYBRID", externalUrl: "https://withplum.com/careers" },
    { companySlug: "persado", title: "NLP Engineer", location: "Athens", type: "HYBRID", externalUrl: "https://www.persado.com/careers" },
  ];

  for (const job of jobListings) {
    const company = await prisma.company.findUnique({ where: { slug: job.companySlug } });
    if (company) {
      await prisma.jobListing.create({
        data: {
          companyId: company.id,
          title: job.title,
          location: job.location,
          type: job.type,
          externalUrl: job.externalUrl,
          status: "ACTIVE",
        },
      });
    }
  }

  // Sample events
  const events = [
    { companySlug: "hack-the-box", title: "Intro to Penetration Testing", type: "WORKSHOP", date: new Date("2026-03-25"), startTime: "18:00", endTime: "20:00", isOnline: true, capacity: 100 },
    { companySlug: "workable", title: "Building Scalable React Applications", type: "WEBINAR", date: new Date("2026-04-02"), startTime: "17:00", endTime: "18:30", isOnline: true, capacity: 200 },
    { companySlug: "skroutz", title: "Tech Career Meetup Athens", type: "MEETUP", date: new Date("2026-04-10"), startTime: "19:00", endTime: "21:00", location: "Athens, Monastiraki", isOnline: false, capacity: 80 },
    { companySlug: "viva-wallet", title: "FinTech in Greece: Opportunities for Juniors", type: "TALENT_SESSION", date: new Date("2026-04-15"), startTime: "16:00", endTime: "17:30", isOnline: true, capacity: 150 },
    { companySlug: null, title: "POS4work Open Day: Meet the Companies", description: "Meet 10 of Greece's top tech companies in one event. Network, learn about open positions, and get career advice.", type: "MEETUP", date: new Date("2026-04-20"), startTime: "10:00", endTime: "16:00", location: "POS4work Hub, Athens", isOnline: false, capacity: 200 },
  ];

  for (const event of events) {
    const company = event.companySlug
      ? await prisma.company.findUnique({ where: { slug: event.companySlug } })
      : null;
    await prisma.event.create({
      data: {
        companyId: company?.id ?? null,
        title: event.title,
        description: event.description,
        type: event.type,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        isOnline: event.isOnline,
        capacity: event.capacity,
      },
    });
  }

  console.log("Seed complete: 1 admin, 1 candidate, 20 companies, 18 jobs, 5 events");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add seed config to package.json**

Add to `package.json`:
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx: `npm install -D tsx`

**Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected: "Seed complete: 1 admin, 1 candidate, 20 companies, 18 jobs, 5 events"

**Step 4: Verify data in Prisma Studio**

```bash
npx prisma studio
```

Check: 20 companies, 18 job listings, 5 events, 2 users.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add seed data with 20 real Greek tech companies"
```

---

## Task 5: NextAuth Authentication Setup

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/lib/validations/auth.ts`
- Create: `src/components/providers/session-provider.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create auth validation schemas**

Create `src/lib/validations/auth.ts`:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Step 2: Create NextAuth config**

Create `src/lib/auth.ts`:

```ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
```

**Step 3: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Step 4: Create registration API route**

Create `src/app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CANDIDATE",
      },
    });

    return NextResponse.json(
      { message: "Account created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 5: Create session provider**

Create `src/components/providers/session-provider.tsx`:

```tsx
"use client";

import { SessionProvider as NextSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextSessionProvider>{children}</NextSessionProvider>;
}
```

**Step 6: Create NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```ts
import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

**Step 7: Wrap layout with SessionProvider**

Update `src/app/layout.tsx` to wrap children with `<SessionProvider>`.

**Step 8: Verify auth works**

```bash
npm run dev
```

Test: `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"password123"}'`

Expected: 201 response with userId.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth with email/password authentication"
```

---

## Task 6: i18n Setup (next-intl)

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/el.json`
- Create: `src/middleware.ts`
- Modify: `next.config.mjs`
- Restructure: `src/app/[locale]/layout.tsx` and `src/app/[locale]/page.tsx`

**Step 1: Install and configure next-intl**

Refer to next-intl docs for App Router setup. Create routing config:

`src/i18n/routing.ts`:
```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el"],
  defaultLocale: "en",
});
```

`src/i18n/request.ts`:
```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**Step 2: Create middleware for locale detection**

`src/middleware.ts`:
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

**Step 3: Create message files**

`src/messages/en.json` — English translations for all UI text (nav, landing page, buttons, forms, etc.)

`src/messages/el.json` — Greek translations (same structure).

Start with navigation, landing page, auth, and common UI strings. Add more as pages are built.

**Step 4: Move layout to `[locale]` segment**

Move `src/app/layout.tsx` → `src/app/[locale]/layout.tsx` and wrap with `NextIntlClientProvider`. Keep `src/app/layout.tsx` as a minimal root layout.

Move `src/app/page.tsx` → `src/app/[locale]/page.tsx`.

**Step 5: Update next.config.mjs**

```js
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};
export default withNextIntl(nextConfig);
```

**Step 6: Verify i18n works**

Visit `http://localhost:3000/en` and `http://localhost:3000/el`. Both should render with correct language.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add i18n support with next-intl (English + Greek)"
```

---

## Task 7: Shared Layout — Navbar, Footer, Mobile Nav

**Files:**
- Create: `src/components/layout/navbar.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/layout/language-switcher.tsx`
- Create: `src/components/layout/user-menu.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Build Navbar**

Fixed top navbar with:
- Logo (left) — "Hiring Partners" text logo in green
- Nav links (center): Discover, Jobs, Events
- Right side: Language switcher, Sign In / Get Started buttons (guest) OR user avatar dropdown (logged in)
- Dark bg (#0a0e1a), bottom border (#1e293b), green active indicator on current route
- Responsive: hamburger on mobile → Sheet slide-out

**Step 2: Build Footer**

Dark footer with:
- Logo + tagline
- Link columns: Platform (Discover, Jobs, Events), Company (About, Contact), Legal (Terms, Privacy)
- "Powered by POS4work Innovation Hub"
- Social links (LinkedIn, Twitter)

**Step 3: Build Mobile Bottom Nav**

Bottom tab bar for mobile (< 640px):
- 4 tabs: Discover, Jobs, Events, Profile
- Icons from Lucide
- Green active indicator
- Fixed bottom, dark bg

**Step 4: Build Language Switcher**

Toggle between EN/EL. Uses next-intl's `useRouter` and `usePathname` to switch locale while preserving the current path.

**Step 5: Build User Menu**

Dropdown for authenticated users showing name, role badge, links to Dashboard, Settings, Sign Out.

**Step 6: Integrate into layout**

Add Navbar + Footer to `src/app/[locale]/layout.tsx`. Mobile nav visible only on small screens.

**Step 7: Verify responsive layout**

Check desktop (1280px), tablet (768px), mobile (375px). Navbar collapses, mobile nav appears.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add responsive navbar, footer, and mobile bottom navigation"
```

---

## Task 8: Landing Page

**Files:**
- Create: `src/app/[locale]/(main)/page.tsx`
- Create: `src/components/landing/hero-section.tsx`
- Create: `src/components/landing/animated-counter.tsx`
- Create: `src/components/landing/featured-companies.tsx`
- Create: `src/components/landing/how-it-works.tsx`
- Create: `src/components/landing/upcoming-events.tsx`
- Create: `src/components/landing/newsletter-cta.tsx`
- Create: `src/components/landing/for-companies-cta.tsx`
- Create: `src/components/shared/company-card.tsx`
- Create: `src/components/shared/event-card.tsx`

**Step 1: Build HeroSection**

- Dot-grid background pattern (CSS)
- Large heading: "Discover the tech companies shaping Greece's future"
- Subtitle: "Follow innovative startups. Get alerts. Join the community."
- Two CTAs: "Explore Companies" (primary green), "I'm a Company" (secondary outline)
- Animated stat counters below: Companies (20+), Candidates (500+), Events (50+), Sectors (10+)
- AnimatedCounter component uses Intersection Observer to trigger count-up animation with JetBrains Mono font

**Step 2: Build FeaturedCompanies section**

- Heading: "Featured Companies"
- Horizontal scrollable row of CompanyCard (mini variant — logo, name, industry, open roles count)
- Data fetched server-side from Prisma: `featured: true` companies
- "View All →" link to /discover

**Step 3: Build HowItWorks section**

3-column grid:
1. Search icon + "Discover" + "Browse companies by sector, technology, or location"
2. Heart icon + "Follow" + "Follow the companies you love and build your feed"
3. Bell icon + "Get Alerted" + "Receive notifications when they open new positions"

**Step 4: Build UpcomingEvents section**

- 2-3 EventCard components showing next events from seed data
- EventCard: date (prominent), title, type badge, host company, location, register CTA
- Data fetched server-side: upcoming events sorted by date

**Step 5: Build NewsletterCTA section**

- Dark section with subtle gradient
- "Stay in the loop. Join 500+ candidates."
- Email input + Subscribe button (mock — shows toast on submit)

**Step 6: Build ForCompaniesCTA section**

- "Get discovered by the next generation of talent"
- "Claim your company page and showcase your team, culture, and opportunities"
- CTA: "Claim Your Company Page →"

**Step 7: Build shared CompanyCard component**

Used across landing, discover, and dashboard pages:
- Company logo (with fallback letter avatar)
- Company name
- Industry badge (teal pill)
- Location text
- Open roles count (green if > 0)
- Follower count (heart icon)
- Verified/Auto-generated badge
- Follow button (requires auth)
- Hover: glow border effect, slight scale

**Step 8: Build shared EventCard component**

- Date block (day number large, month small)
- Event title, type badge (colored by type)
- Host company logo + name (or "POS4work" for platform events)
- Location (Online badge or address)
- Capacity bar (registered/total)
- Register CTA button

**Step 9: Wire data fetching**

Landing page is a Server Component. Fetch featured companies, upcoming events, and stats counts directly from Prisma.

**Step 10: Verify landing page**

Visit `/en`. All sections render with seed data. Responsive on all breakpoints.

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: build landing page with hero, stats, featured companies, events"
```

---

## Task 9: Auth Pages (Login + Register)

**Files:**
- Create: `src/app/[locale]/(auth)/login/page.tsx`
- Create: `src/app/[locale]/(auth)/register/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/app/[locale]/(auth)/layout.tsx`

**Step 1: Create auth layout**

Centered layout with dark bg, no navbar/footer. Logo at top, card-style form container, "Back to home" link.

**Step 2: Build LoginForm**

- Client Component with react-hook-form + zod
- Fields: email, password
- Submit calls `signIn("credentials", { ... })` from next-auth/react
- Error display for invalid credentials
- Link to Register page
- Loading state on submit button

**Step 3: Build RegisterForm**

- Client Component with react-hook-form + zod
- Fields: name, email, password
- Submit POSTs to `/api/auth/register`, then auto-signs in
- Error display for duplicate email
- Link to Login page
- After successful register → redirect to `/onboarding`

**Step 4: Verify auth flow**

- Register new user → redirected to onboarding
- Log out → login with same credentials → redirected to discover
- Invalid credentials → error shown

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add login and registration pages with form validation"
```

---

## Task 10: Candidate Onboarding (3-Step Wizard)

**Files:**
- Create: `src/app/[locale]/(main)/onboarding/page.tsx`
- Create: `src/components/onboarding/onboarding-wizard.tsx`
- Create: `src/components/onboarding/step-about.tsx`
- Create: `src/components/onboarding/step-interests.tsx`
- Create: `src/components/onboarding/step-preferences.tsx`
- Create: `src/components/shared/multi-select-chips.tsx`
- Create: `src/components/shared/tag-input.tsx`
- Create: `src/app/api/onboarding/route.ts`
- Create: `src/lib/validations/onboarding.ts`

**Step 1: Create onboarding validation**

Zod schema for all 3 steps combined.

**Step 2: Build OnboardingWizard container**

- Client Component managing current step (1-3)
- Progress bar at top (shadcn Progress component)
- Step indicator: "Step X of 3"
- Back/Next navigation buttons
- Form state persisted across steps (react-hook-form)

**Step 3: Build StepAbout**

- Full Name (pre-filled from registration)
- Headline (e.g., "CS Student at AUEB")
- LinkedIn URL (optional)
- Experience Level: radio group (Student, Recent Graduate, Junior Professional)

**Step 4: Build StepInterests**

- Role Interests: MultiSelectChips component (Frontend, Backend, Full-Stack, Data, Design, Product, DevOps, Marketing, Sales, Operations)
- Skills: TagInput component with autocomplete suggestions
- Industries: MultiSelectChips (FinTech, HealthTech, EdTech, SaaS, E-commerce, AI/ML, Cybersecurity, Gaming, IoT, etc.)

**Step 5: Build StepPreferences**

- Preferred Location: MultiSelectChips (Athens, Thessaloniki, Remote, Anywhere in Greece)
- Email Preferences: Switch toggles (Weekly job digest, Event announcements, Community newsletter)
- Language Preference: radio (English, Greek)

**Step 6: Build MultiSelectChips component**

Reusable component: renders a list of options as pills/chips. Click to toggle selection. Selected chips get green border + green text. Unselected are muted outline.

**Step 7: Build TagInput component**

Text input where user types a skill, hits Enter to add as a tag. Tags shown as removable badges. Autocomplete dropdown with common tech skills.

**Step 8: Create API route**

`POST /api/onboarding` — Creates/updates CandidateProfile with all fields. Sets `onboardingComplete: true`. Validates with Zod. Requires authenticated session with CANDIDATE role.

**Step 9: Wire up submission**

On final step "Complete Setup" → POST to API → on success, redirect to `/discover` with welcome toast.

**Step 10: Add onboarding guard**

If candidate hasn't completed onboarding and tries to access other pages, redirect to `/onboarding`.

**Step 11: Verify full flow**

Register → 3 steps → complete → redirect to discover. Check data in Prisma Studio.

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: add 3-step candidate onboarding wizard"
```

---

## Task 11: Discover Companies Page

**Files:**
- Create: `src/app/[locale]/(main)/discover/page.tsx`
- Create: `src/components/discover/search-bar.tsx`
- Create: `src/components/discover/filter-bar.tsx`
- Create: `src/components/discover/company-grid.tsx`
- Create: `src/components/discover/sort-dropdown.tsx`
- Create: `src/app/api/companies/route.ts`

**Step 1: Build the page layout**

Server Component page that fetches initial companies from Prisma. Passes data to Client Components for interactivity.

**Step 2: Build SearchBar**

Full-width search input with search icon. Debounced search (300ms) that filters companies by name, description, or technology.

**Step 3: Build FilterBar**

Horizontal scrollable row of filter chips:
- Industry filter (multi-select): All, FinTech, SaaS, HealthTech, AI/ML, E-commerce, EdTech, Cybersecurity, etc.
- Location filter: Athens, Thessaloniki, Remote, Other
- Company size: TINY, SMALL, MEDIUM, LARGE
- Toggle: Has open roles
- Toggle: Verified only

Selected filters shown as active (green border). Clear all button.

**Step 4: Build SortDropdown**

Options: Most Followed, Most Open Roles, Recently Added, Alphabetical.

**Step 5: Build CompanyGrid**

Responsive grid (3-col desktop, 2-col tablet, 1-col mobile) of CompanyCard components. Shows result count. "No companies found" empty state.

**Step 6: Create API route for filtered companies**

`GET /api/companies?search=&industry=&location=&size=&hasRoles=&verified=&sort=&page=&limit=`

Returns paginated companies with follower counts and job counts. Uses Prisma queries with dynamic where clauses.

**Step 7: Wire up client-side filtering**

URL search params for all filters (shareable URLs). Client fetches from API on filter change. Loading skeletons during fetch.

**Step 8: Add follow button functionality**

`POST /api/companies/[id]/follow` — toggle follow/unfollow. Requires auth. Optimistic UI update on CompanyCard.

**Step 9: Verify discover page**

All 20 companies visible. Filters work. Search works. Follow toggle works (when logged in). Responsive layout.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: build discover companies page with filters, search, and follow"
```

---

## Task 12: Company Profile Page

**Files:**
- Create: `src/app/[locale]/(main)/companies/[slug]/page.tsx`
- Create: `src/components/company/company-hero.tsx`
- Create: `src/components/company/company-tabs.tsx`
- Create: `src/components/company/about-tab.tsx`
- Create: `src/components/company/roles-tab.tsx`
- Create: `src/components/company/events-tab.tsx`
- Create: `src/components/company/gallery-tab.tsx`
- Create: `src/components/shared/verified-badge.tsx`
- Create: `src/components/shared/auto-generated-badge.tsx`
- Create: `src/components/shared/follow-button.tsx`

**Step 1: Build CompanyHero**

- Cover image area (gradient fallback if no image)
- Company logo (large, with letter avatar fallback)
- Company name (large heading)
- Description tagline (first sentence of description)
- Badges row: industry, location(s), company size
- Action buttons: Follow (heart), Website (external link), LinkedIn (external link)
- Follower count
- Badge: "Auto-generated profile" with "Claim this company page →" button OR "Verified employer" green badge

**Step 2: Build CompanyTabs**

shadcn Tabs component with 4 tabs:
- About (default active)
- Open Roles (show count badge)
- Events (show count badge)
- Gallery (only visible for verified companies)

**Step 3: Build AboutTab**

- Full description (rendered as paragraphs)
- Technologies section: tag pills for each technology
- Company Info sidebar: Founded, Size, HQ, Industry, Website

**Step 4: Build RolesTab**

- List of JobListing cards
- Each card: title, location, type badge (Remote/Hybrid/Onsite), posted date
- CTA: "View on Company Site ↗" (external link, opens new tab)
- Empty state: "No open roles right now. Follow to get notified!"

**Step 5: Build EventsTab**

- List of upcoming events for this company
- Reuses EventCard component
- Empty state: "No upcoming events"

**Step 6: Build GalleryTab**

- Photo grid (3 columns)
- Only shown for VERIFIED companies
- Empty state for unverified: "Gallery available for verified companies"

**Step 7: Build FollowButton**

Reusable Client Component:
- Heart icon, toggles filled/outline
- Shows follower count
- Optimistic update
- Redirect to login if not authenticated
- Subtle animation on toggle

**Step 8: Wire server-side data**

Page is Server Component. Fetch company by slug with related jobs, events, followers count. 404 if not found.

**Step 9: Verify company profile**

Visit `/en/companies/workable`. All tabs render. Follow button works. External links open correctly. Badges display correctly.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: build company profile page with tabs, follow, and badges"
```

---

## Task 13: Jobs Page

**Files:**
- Create: `src/app/[locale]/(main)/jobs/page.tsx`
- Create: `src/components/jobs/job-list.tsx`
- Create: `src/components/jobs/job-card.tsx`
- Create: `src/components/jobs/job-filters.tsx`
- Create: `src/app/api/jobs/route.ts`

**Step 1: Build Jobs page**

Aggregated view of all active job listings across all companies.

**Step 2: Build JobCard**

- Job title (prominent)
- Company logo + name (link to company profile)
- Location
- Type badge (Remote green, Hybrid blue, Onsite gray)
- Posted date (relative: "3 days ago")
- Save button (bookmark icon, requires auth)
- "View on Company Site ↗" external link button

**Step 3: Build JobFilters**

- Search by title
- Filter by type (Remote, Hybrid, Onsite)
- Filter by location
- Filter by company
- Sort: Newest, Company name

**Step 4: Build API route**

`GET /api/jobs?search=&type=&location=&company=&sort=&page=&limit=`

Returns jobs with company info (name, logo, slug).

**Step 5: Wire up and verify**

All 18 seed jobs displayed. Filters work. External links open. Save button toggles.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: build jobs page with filters and external link cards"
```

---

## Task 14: Events Page

**Files:**
- Create: `src/app/[locale]/(main)/events/page.tsx`
- Create: `src/components/events/event-grid.tsx`
- Create: `src/components/events/event-filters.tsx`
- Create: `src/components/events/event-registration-button.tsx`
- Create: `src/app/api/events/route.ts`
- Create: `src/app/api/events/[id]/register/route.ts`

**Step 1: Build Events page**

Global events directory. All upcoming events from all companies + platform events.

**Step 2: Build EventFilters**

- Type filter chips: All, Workshops, Meetups, Webinars, Talent Sessions
- Date filter: Upcoming, This Week, This Month
- Location: Online, In-Person

**Step 3: Build EventGrid**

2-column grid of EventCards (from Task 8). Sorted by date ascending (nearest first).

**Step 4: Build EventRegistrationButton**

- "Register" button on each event
- Requires auth → redirect to login if not
- POST `/api/events/[id]/register` → toggles registration
- Shows "Registered ✓" state after registration
- Shows registration count / capacity

**Step 5: Past events section**

Collapsible section showing past events (grayed out). Default collapsed.

**Step 6: Verify events page**

5 seed events displayed. Filters work. Registration works. Past events section works.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: build events page with filters and registration"
```

---

## Task 15: Claim Company Flow

**Files:**
- Create: `src/components/company/claim-company-modal.tsx`
- Create: `src/lib/validations/claim.ts`
- Create: `src/app/api/claims/route.ts`

**Step 1: Create claim validation**

Zod schema: fullName (required), jobTitle (required), workEmail (required, email format), linkedinUrl (optional, URL format), message (optional).

**Step 2: Build ClaimCompanyModal**

shadcn Dialog component:
- Triggered by "Claim this company page" button on company profile
- Form fields: Full Name, Job Title, Work Email (with note "must match company domain"), LinkedIn Profile (optional), Message (optional textarea)
- Submit button: "Submit Claim Request"
- Loading state during submission
- Success state: "Your claim request has been submitted! Our team will review it within 2 business days."
- Error state: inline field errors, "already claimed" error

**Step 3: Build API route**

`POST /api/claims` — Creates CompanyClaim record. Requires auth. Validates: company exists, company not already VERIFIED, user hasn't already submitted a pending claim for this company.

**Step 4: Integrate into company profile**

Show "Claim this company page →" button only on AUTO_GENERATED companies. Hide for VERIFIED companies. Show "Claim pending review" for companies with user's pending claim.

**Step 5: Verify claim flow**

Login as demo candidate → visit auto-generated company → click claim → fill form → submit → see success message. Check claim in Prisma Studio.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add claim company modal and submission flow"
```

---

## Task 16: Candidate Dashboard

**Files:**
- Create: `src/app/[locale]/(main)/dashboard/candidate/page.tsx`
- Create: `src/components/dashboard/candidate/followed-companies.tsx`
- Create: `src/components/dashboard/candidate/saved-jobs.tsx`
- Create: `src/components/dashboard/candidate/profile-settings.tsx`
- Create: `src/app/api/candidate/profile/route.ts`

**Step 1: Build candidate dashboard layout**

Tab-based layout (not sidebar — simpler for candidates):
- Tabs: Following, Saved Jobs, Settings

**Step 2: Build FollowedCompanies tab**

Grid of CompanyCards for companies the user follows. Empty state: "You're not following any companies yet. Discover companies →"

**Step 3: Build SavedJobs tab**

List of saved job listings with company info. Remove save button. Empty state: "No saved jobs. Browse jobs →"

**Step 4: Build ProfileSettings tab**

Form to edit candidate profile:
- Name, headline, LinkedIn
- Experience level
- Skills, role interests, industries (reuse onboarding components)
- Email preferences (toggles)
- Language preference
- Save button → PUT /api/candidate/profile

**Step 5: Build API route**

`GET /api/candidate/profile` — Returns candidate profile with followed companies and saved jobs.
`PUT /api/candidate/profile` — Updates candidate profile fields.

**Step 6: Verify dashboard**

Login as demo candidate. See followed companies (none initially). Save a job, see it in Saved Jobs. Edit profile settings.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: build candidate dashboard with following, saved jobs, and settings"
```

---

## Task 17: Company Dashboard

**Files:**
- Create: `src/app/[locale]/(main)/dashboard/company/page.tsx`
- Create: `src/app/[locale]/(main)/dashboard/company/layout.tsx`
- Create: `src/components/dashboard/company/sidebar.tsx`
- Create: `src/components/dashboard/company/overview.tsx`
- Create: `src/components/dashboard/company/profile-editor.tsx`
- Create: `src/components/dashboard/company/job-manager.tsx`
- Create: `src/components/dashboard/company/event-manager.tsx`
- Create: `src/components/dashboard/company/gallery-manager.tsx`
- Create: `src/components/dashboard/company/analytics.tsx`
- Create: `src/components/shared/stats-card.tsx`
- Create: `src/app/api/dashboard/company/[...path]/route.ts`

**Step 1: Build dashboard layout with sidebar**

Sidebar navigation (collapsible on mobile):
- Company logo + name + "Verified" badge
- Links: Overview, Company Profile, Job Listings, Events, Gallery, Analytics, Settings

**Step 2: Build Overview page**

- 3 StatsCards: Followers count, Active Roles count, Upcoming Events count
- Follower growth chart (Recharts LineChart — mock data for MVP, last 30 days)
- Recent activity feed (last 5 actions: new followers, job views, event registrations)

**Step 3: Build ProfileEditor**

Form to edit company profile:
- Company name, description (textarea with character count)
- Industry (select), Size (select), Founded year
- Website URL, LinkedIn URL
- Locations (tag input)
- Technologies (tag input)
- Logo upload (file input with preview)
- Cover image upload (file input with preview)
- Save button → PUT API

**Step 4: Build JobManager**

- Table of company's job listings
- Columns: Title, Location, Type, Status, Posted, Actions
- Actions: Edit, Pause/Activate, Delete
- "Add Job" button → form dialog (title, location, type, external URL)
- CRUD via API routes

**Step 5: Build EventManager**

- Table of company's events
- Columns: Title, Type, Date, Location, Registrations, Actions
- Actions: Edit, Delete
- "Add Event" button → form dialog
- View registrations list for each event

**Step 6: Build GalleryManager**

- Grid of uploaded images with captions
- Drag-to-reorder (simple, using order field)
- Upload new image button
- Delete image button
- Edit caption inline

**Step 7: Build Analytics page**

Recharts charts:
- Profile views over time (LineChart — mock data for now)
- Follower growth (AreaChart)
- Job listing clicks (BarChart per listing)
- Top followers by experience level (PieChart)

**Step 8: Build StatsCard component**

Reusable: icon + number + label + trend indicator (up/down arrow with percentage). Dark card with subtle border.

**Step 9: Build API routes**

`/api/dashboard/company/profile` — GET, PUT (company profile)
`/api/dashboard/company/jobs` — GET, POST (list, create)
`/api/dashboard/company/jobs/[id]` — PUT, DELETE (update, delete)
`/api/dashboard/company/events` — GET, POST
`/api/dashboard/company/events/[id]` — PUT, DELETE
`/api/dashboard/company/analytics` — GET (aggregated stats)
`/api/dashboard/company/gallery` — GET, POST, DELETE

All routes: validate session, verify user role is COMPANY_REP, verify user's claim is approved for this company.

**Step 10: Verify full company dashboard**

Create a COMPANY_REP user → approve claim in DB → access dashboard. Edit profile, add job, add event, view analytics.

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: build company dashboard with profile editor, jobs, events, and analytics"
```

---

## Task 18: Admin Dashboard

**Files:**
- Create: `src/app/[locale]/(main)/admin/page.tsx`
- Create: `src/app/[locale]/(main)/admin/layout.tsx`
- Create: `src/components/admin/sidebar.tsx`
- Create: `src/components/admin/overview.tsx`
- Create: `src/components/admin/companies-table.tsx`
- Create: `src/components/admin/candidates-table.tsx`
- Create: `src/components/admin/claims-queue.tsx`
- Create: `src/components/admin/jobs-table.tsx`
- Create: `src/components/admin/events-manager.tsx`
- Create: `src/components/admin/newsletter-composer.tsx`
- Create: `src/components/admin/analytics-dashboard.tsx`
- Create: `src/app/api/admin/[...path]/route.ts`
- Create: `src/middleware.ts` (update with admin route protection)

**Step 1: Build admin layout with sidebar**

Sidebar: Dashboard, Companies, Candidates, Claim Requests (with pending count badge), Job Listings, Events, Newsletters, AI Content, Analytics, Settings.

**Step 2: Build Overview page**

- KPI cards: Total Companies, Total Candidates, Pending Claims, Active Jobs
- Signup trends (AreaChart, last 30 days)
- Top followed companies (mini leaderboard)
- Pending actions alert banner

**Step 3: Build CompaniesTable**

shadcn Table with:
- Columns: Logo, Name, Industry, Status badge, Followers, Jobs, Actions
- Actions: Edit, Feature/Unfeature, Delete
- "Add Company" button → opens form
- Search + filter by status
- Pagination

**Step 4: Build CandidatesTable**

- Columns: Name, Email, Experience Level, Skills (truncated), Joined, Actions
- Actions: View profile, Export
- Search, filter by experience level
- CSV export button

**Step 5: Build ClaimsQueue**

- List of pending claims
- Each claim card: Company name, Requester name + email + job title + work email + LinkedIn
- Action buttons: Approve (with optional note), Reject (with required reason)
- Approve: changes company status to VERIFIED, user role to COMPANY_REP, sends mock email
- Reject: sends mock email with reason

**Step 6: Build JobsTable**

- All job listings across platform
- Columns: Title, Company, Location, Type, Status, Posted
- Actions: Pause, Delete (moderation)

**Step 7: Build EventsManager**

- All events (company + platform)
- Create platform events (no company association)
- Edit, delete any event

**Step 8: Build NewsletterComposer**

- Subject input
- Content textarea (markdown or simple HTML)
- Preview panel (shows rendered version)
- "Send to all candidates" button (mock — just updates DB status to SENT)
- List of past newsletters

**Step 9: Build AnalyticsDashboard**

- Platform growth: signups over time, follows over time
- Company performance: top companies by followers, by job views
- Candidate demographics: experience level distribution, location distribution, top skills
- All using Recharts

**Step 10: Build API routes**

All under `/api/admin/` with admin role check:
- `/companies` — CRUD + bulk operations
- `/candidates` — list + export
- `/claims` — list pending, approve, reject
- `/jobs` — list + moderate
- `/events` — CRUD
- `/newsletters` — CRUD + send
- `/analytics` — aggregated platform stats

**Step 11: Add admin middleware**

Update `src/middleware.ts` to check session role for `/admin/*` routes. Redirect non-admins to home.

**Step 12: Verify admin dashboard**

Login as admin@pos4work.gr / admin123. All sections render. Approve a claim → company becomes verified. Create newsletter. View analytics.

**Step 13: Commit**

```bash
git add -A
git commit -m "feat: build admin dashboard with companies, claims, newsletters, and analytics"
```

---

## Task 19: Final Polish & Responsive QA

**Files:**
- Various component tweaks
- Create: `src/app/[locale]/not-found.tsx`
- Create: `src/components/shared/error-boundary.tsx`

**Step 1: Add 404 page**

Custom dark-themed 404 page with "Page not found" message and "Go Home" button.

**Step 2: Add loading states**

Skeleton loaders for:
- Company grid (discover page)
- Company profile (loading slug)
- Dashboard tables
- Job list

**Step 3: Add empty states**

Custom empty state component for:
- No search results
- No followed companies
- No saved jobs
- No upcoming events

**Step 4: Responsive QA**

Test all pages at:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 768px (iPad)
- 1024px (laptop)
- 1440px (desktop)

Fix any layout issues, overflow, text truncation.

**Step 5: Accessibility check**

- Verify keyboard navigation on all interactive elements
- Check color contrast (neon green on dark bg)
- Add aria-labels where missing
- Test with screen reader basics

**Step 6: Add toast notifications**

Wire up shadcn Toast/Sonner for all user actions:
- Follow/unfollow
- Save/unsave job
- Event registration
- Form submissions
- Errors

**Step 7: Performance check**

```bash
npm run build
```

Check for any build errors or warnings. Verify all pages build as static or dynamic correctly.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add 404 page, loading states, empty states, and polish responsive design"
```

---

## Task 20: Complete i18n Translations

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/el.json`

**Step 1: Audit all hardcoded strings**

Search codebase for any hardcoded English strings in components. Replace with `useTranslations()` / `getTranslations()` calls.

**Step 2: Complete English translations**

Ensure `en.json` has all strings organized by namespace:
- `nav`, `landing`, `discover`, `company`, `jobs`, `events`, `auth`, `onboarding`, `dashboard`, `admin`, `common`

**Step 3: Complete Greek translations**

Translate all strings to Greek in `el.json`. Use proper Greek characters and formatting.

**Step 4: Verify language switching**

Test EN → EL switching on every page. Verify all text changes. Check for layout issues with longer Greek text.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete i18n translations for English and Greek"
```

---

## Task 21: Final Build & Verification

**Step 1: Run full build**

```bash
npm run build
```

Fix any TypeScript errors, import issues, or build failures.

**Step 2: Run production mode**

```bash
npm start
```

Test all critical flows:
1. Landing page loads with stats and companies
2. Register → onboarding → discover
3. Follow a company → see it in dashboard
4. View company profile with all tabs
5. Browse and filter jobs
6. Browse and register for events
7. Claim a company page
8. Admin: approve claim, manage companies
9. Language switching works everywhere

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final build verification and fixes"
```

---

## Execution Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Project scaffolding | None |
| 2 | Dark theme design system | Task 1 |
| 3 | Prisma schema & database | Task 1 |
| 4 | Seed data (20 companies) | Task 3 |
| 5 | NextAuth authentication | Task 3 |
| 6 | i18n setup (next-intl) | Task 1 |
| 7 | Shared layout (navbar, footer) | Tasks 2, 5, 6 |
| 8 | Landing page | Task 7 |
| 9 | Auth pages (login/register) | Tasks 5, 7 |
| 10 | Candidate onboarding | Task 9 |
| 11 | Discover companies | Tasks 7, 4 |
| 12 | Company profile | Tasks 11, 5 |
| 13 | Jobs page | Tasks 4, 7 |
| 14 | Events page | Tasks 4, 7 |
| 15 | Claim company flow | Task 12 |
| 16 | Candidate dashboard | Tasks 10, 11 |
| 17 | Company dashboard | Tasks 12, 15 |
| 18 | Admin dashboard | Tasks 15, 4 |
| 19 | Polish & QA | Tasks 8-18 |
| 20 | Complete i18n | Tasks 8-18 |
| 21 | Final build & verification | Tasks 19, 20 |

**Parallelizable groups:**
- Tasks 2, 3, 6 can run in parallel after Task 1
- Tasks 4, 5 can run in parallel after Task 3
- Tasks 11, 13, 14 can run in parallel after Task 7
- Tasks 19, 20 can run in parallel after all feature tasks
