import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // ── 1. Users ──────────────────────────────────────────────────────────

  const adminPassword = await hashPassword("admin123");
  const demoPassword = await hashPassword("demo123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@pos4work.gr" },
    update: {},
    create: {
      email: "admin@pos4work.gr",
      name: "Platform Admin",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  const repPassword = await hashPassword("rep123");

  const companyRep = await prisma.user.upsert({
    where: { email: "rep@company.gr" },
    update: {},
    create: {
      email: "rep@company.gr",
      name: "Nikos Georgiou",
      password: repPassword,
      role: "COMPANY_REP",
      emailVerified: true,
      avatarUrl: null,
      bio: "Talent acquisition professional with 8 years of experience in Greek tech.",
      publicTitle: "Head of Talent Acquisition",
      linkedinUrl: "https://linkedin.com/in/nikos-georgiou",
      website: null,
      isProfilePublic: true,
    },
  });
  console.log(`✓ Company rep user: ${companyRep.email}`);

  const candidate = await prisma.user.upsert({
    where: { email: "demo@candidate.gr" },
    update: {},
    create: {
      email: "demo@candidate.gr",
      name: "Maria Papadopoulou",
      password: demoPassword,
      role: "CANDIDATE",
      emailVerified: true,
      linkedinUrl: "https://linkedin.com/in/maria-papadopoulou",
      candidateProfile: {
        create: {
          headline: "Full-Stack Developer | React & Node.js",
          experienceLevel: "MID",
          skills: JSON.stringify([
            "React",
            "TypeScript",
            "Node.js",
            "PostgreSQL",
            "Docker",
            "GraphQL",
          ]),
          roleInterests: JSON.stringify([
            "Full-Stack Developer",
            "Frontend Engineer",
            "Software Engineer",
          ]),
          industries: JSON.stringify(["FinTech", "E-commerce", "SaaS"]),
          preferredLocations: JSON.stringify(["Athens", "Remote"]),
          emailDigest: true,
          emailEvents: true,
          emailNewsletter: true,
          onboardingComplete: true,
        },
      },
    },
  });
  console.log(`✓ Demo candidate: ${candidate.email}`);

  // ── 1b. Candidate Profile Enrichment ──────────────────────────────────

  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: candidate.id },
  });

  if (candidateProfile) {
    await prisma.workExperience.deleteMany({ where: { candidateProfileId: candidateProfile.id } });
    await prisma.workExperience.createMany({
      data: [
        {
          candidateProfileId: candidateProfile.id,
          company: "Skroutz",
          role: "Senior Frontend Engineer",
          startDate: new Date("2023-01-15"),
          current: true,
          description: "Led the redesign of the merchant dashboard. Built component library used across 4 teams.",
          order: 0,
        },
        {
          candidateProfileId: candidateProfile.id,
          company: "Blueground",
          role: "Frontend Developer",
          startDate: new Date("2020-06-01"),
          endDate: new Date("2022-12-31"),
          description: "Built the guest-facing booking flow and internal property management tools.",
          order: 1,
        },
      ],
    });

    await prisma.education.deleteMany({ where: { candidateProfileId: candidateProfile.id } });
    await prisma.education.create({
      data: {
        candidateProfileId: candidateProfile.id,
        institution: "National Technical University of Athens",
        degree: "Bachelor's",
        field: "Electrical & Computer Engineering",
        startYear: 2015,
        endYear: 2020,
      },
    });

    await prisma.candidateProfile.update({
      where: { id: candidateProfile.id },
      data: {
        availability: "OPEN_TO_WORK",
        preferredWorkType: "HYBRID",
        portfolioUrl: "https://maria.dev",
        githubUrl: "https://github.com/mariapapadopoulou",
      },
    });

    console.log(`✓ Candidate profile enriched with work experience, education, and preferences`);
  }

  // ── 2. Companies ──────────────────────────────────────────────────────

  const companies = [
    {
      slug: "workable",
      name: "Workable",
      description:
        "Workable is the world's leading hiring platform, helping companies find and hire great talent. Founded in Athens and headquartered in both Athens and London, Workable serves over 27,000 companies worldwide with AI-powered recruiting tools.",
      industry: "HR Tech",
      website: "https://www.workable.com",
      linkedinUrl: "https://www.linkedin.com/company/workable",
      logo: "/logos/workable.svg",
      size: "LARGE",
      founded: 2012,
      locations: JSON.stringify(["Athens", "London"]),
      technologies: JSON.stringify([
        "Ruby on Rails",
        "React",
        "AWS",
        "Kubernetes",
        "Python",
        "Elasticsearch",
      ]),
      status: "VERIFIED",
      featured: true,
      vcFunded: true,
    },
    {
      slug: "viva-wallet",
      name: "Viva Wallet",
      description:
        "Viva Wallet is a European cloud-based neobank and payment institution, offering a full suite of payment solutions. Headquartered in Athens, it is the first entirely cloud-based payment institution in Europe, processing billions in transactions annually.",
      industry: "FinTech",
      website: "https://www.vivawallet.com",
      linkedinUrl: "https://www.linkedin.com/company/viva-wallet",
      logo: "/logos/viva-wallet.svg",
      size: "LARGE",
      founded: 2010,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Java",
        ".NET",
        "Kubernetes",
        "Azure",
        "React",
        "PostgreSQL",
      ]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "blueground",
      name: "Blueground",
      description:
        "Blueground provides furnished apartments for stays of one month or longer in major cities worldwide. Founded in Athens in 2013, Blueground has expanded to over 15,000 apartments across 30+ cities including New York, Dubai, and London.",
      industry: "PropTech",
      website: "https://www.theblueground.com",
      linkedinUrl: "https://www.linkedin.com/company/theblueground",
      logo: "/logos/blueground.svg",
      size: "LARGE",
      founded: 2013,
      locations: JSON.stringify(["Athens", "New York City"]),
      technologies: JSON.stringify([
        "Python",
        "Django",
        "React",
        "AWS",
        "Terraform",
        "TypeScript",
      ]),
      status: "VERIFIED",
      featured: true,
      vcFunded: true,
    },
    {
      slug: "skroutz",
      name: "Skroutz",
      description:
        "Skroutz is Greece's leading e-commerce marketplace and price comparison platform, serving millions of users monthly. With its own last-mile delivery network and fintech products, Skroutz has transformed online shopping in Greece.",
      industry: "E-commerce",
      website: "https://www.skroutz.gr",
      linkedinUrl: "https://www.linkedin.com/company/skroutz",
      logo: "/logos/skroutz.svg",
      size: "LARGE",
      founded: 2005,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Ruby on Rails",
        "Go",
        "React",
        "Elasticsearch",
        "Kafka",
        "Kubernetes",
      ]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "epignosis",
      name: "Epignosis / TalentLMS",
      description:
        "Epignosis is the company behind TalentLMS, one of the world's most popular learning management systems. Based in Athens, their platform serves over 70,000 organizations and millions of learners globally.",
      industry: "EdTech",
      website: "https://www.talentlms.com",
      linkedinUrl: "https://www.linkedin.com/company/epignosis",
      logo: "/logos/epignosis.svg",
      size: "MEDIUM",
      founded: 2012,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "PHP",
        "Laravel",
        "Vue.js",
        "AWS",
        "MySQL",
        "Redis",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "beat",
      name: "Beat / Taxibeat",
      description:
        "Beat (formerly Taxibeat) is a ride-hailing app founded in Athens that expanded across Latin America and Southern Europe. The platform combines cutting-edge mobile technology with smart algorithms to connect riders with drivers.",
      industry: "Mobility",
      website: "https://thebeat.co",
      linkedinUrl: "https://www.linkedin.com/company/theaborad",
      logo: "/logos/beat.svg",
      size: "LARGE",
      founded: 2011,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Kotlin",
        "Swift",
        "Go",
        "Kafka",
        "PostgreSQL",
        "GCP",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "plum",
      name: "Plum",
      description:
        "Plum is an AI-powered money management app that helps users save, invest, and manage their finances automatically. Founded by a Greek team in London, Plum serves over 2 million users across Europe.",
      industry: "FinTech",
      website: "https://withplum.com",
      linkedinUrl: "https://www.linkedin.com/company/withplum",
      logo: "/logos/plum.svg",
      size: "MEDIUM",
      founded: 2016,
      locations: JSON.stringify(["Athens", "London"]),
      technologies: JSON.stringify([
        "Python",
        "React Native",
        "AWS",
        "Node.js",
        "PostgreSQL",
        "Terraform",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "upstream",
      name: "Upstream",
      description:
        "Upstream is a leading mobile technology company that provides mobile marketing and security platforms for telecom operators worldwide. Headquartered in Athens, it reaches over 1.2 billion users across emerging markets.",
      industry: "Mobile Tech",
      website: "https://www.upstreamsystems.com",
      linkedinUrl: "https://www.linkedin.com/company/upstream-systems",
      logo: "/logos/upstream.svg",
      size: "MEDIUM",
      founded: 2004,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Java",
        "Spring Boot",
        "Angular",
        "AWS",
        "Machine Learning",
        "Big Data",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "persado",
      name: "Persado",
      description:
        "Persado uses AI and machine learning to generate marketing language that motivates action. Founded in Athens with offices in New York, Persado works with the world's largest brands to optimize their communications at scale.",
      industry: "AI / MarTech",
      website: "https://www.persado.com",
      linkedinUrl: "https://www.linkedin.com/company/persado",
      logo: "/logos/persado.svg",
      size: "MEDIUM",
      founded: 2012,
      locations: JSON.stringify(["Athens", "New York City"]),
      technologies: JSON.stringify([
        "Python",
        "TensorFlow",
        "NLP",
        "React",
        "AWS",
        "Kubernetes",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "softomotive",
      name: "Softomotive / Microsoft",
      description:
        "Softomotive was an Athens-based leader in robotic process automation (RPA) acquired by Microsoft in 2020. Its technology became Microsoft Power Automate Desktop, bringing Greek engineering innovation into the core Microsoft ecosystem.",
      industry: "RPA",
      website: "https://powerautomate.microsoft.com",
      linkedinUrl: "https://www.linkedin.com/company/softomotive",
      logo: "/logos/softomotive.svg",
      size: "LARGE",
      founded: 2005,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "C#",
        ".NET",
        "Azure",
        "TypeScript",
        "React",
        "AI/ML",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "accusonus",
      name: "Accusonus / Meta",
      description:
        "Accusonus was a Patras-based audio AI company specializing in noise reduction and audio processing. Acquired by Meta in 2022, its deep learning technology is now integrated into Meta's virtual and augmented reality products.",
      industry: "AI / Audio",
      website: "https://about.meta.com",
      linkedinUrl: "https://www.linkedin.com/company/accusonus",
      logo: "/logos/accusonus.svg",
      size: "SMALL",
      founded: 2013,
      locations: JSON.stringify(["Patras"]),
      technologies: JSON.stringify([
        "Python",
        "C++",
        "PyTorch",
        "DSP",
        "CUDA",
        "Audio ML",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "intelligencia-ai",
      name: "Intelligencia AI",
      description:
        "Intelligencia AI uses machine learning to predict clinical trial outcomes and accelerate drug development. With offices in Athens and Boston, the company helps pharma companies make smarter R&D decisions with data-driven insights.",
      industry: "HealthTech",
      website: "https://www.intelligencia.ai",
      linkedinUrl: "https://www.linkedin.com/company/intelligencia-ai",
      logo: "/logos/intelligencia-ai.svg",
      size: "SMALL",
      founded: 2019,
      locations: JSON.stringify(["Athens", "Boston"]),
      technologies: JSON.stringify([
        "Python",
        "scikit-learn",
        "PyTorch",
        "React",
        "AWS",
        "Docker",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "hack-the-box",
      name: "Hack The Box",
      description:
        "Hack The Box is the world's leading gamified cybersecurity training platform, used by individuals, universities, and enterprises alike. Founded in Athens, it has grown into a global community of over 2 million security professionals.",
      industry: "Cybersecurity",
      website: "https://www.hackthebox.com",
      linkedinUrl: "https://www.linkedin.com/company/hackthebox",
      logo: "/logos/hack-the-box.svg",
      size: "MEDIUM",
      founded: 2017,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Go",
        "Kubernetes",
        "Docker",
        "React",
        "PostgreSQL",
        "Terraform",
      ]),
      status: "VERIFIED",
      featured: true,
    },
    {
      slug: "warply",
      name: "Warply",
      description:
        "Warply provides a mobile-first CRM and loyalty platform that helps brands engage their customers through personalized campaigns. Based in Athens, the company powers loyalty programs for major Greek banks and retailers.",
      industry: "MarTech",
      website: "https://www.warply.com",
      linkedinUrl: "https://www.linkedin.com/company/warply",
      logo: "/logos/warply.svg",
      size: "SMALL",
      founded: 2013,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Java",
        "Swift",
        "Kotlin",
        "AWS",
        "MongoDB",
        "React Native",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "pollfish",
      name: "Pollfish",
      description:
        "Pollfish is a mobile-first survey platform that leverages a vast global network to deliver fast, high-quality market research. Founded in Athens with offices in New York, the platform connects researchers with real consumers worldwide.",
      industry: "Research",
      website: "https://www.pollfish.com",
      linkedinUrl: "https://www.linkedin.com/company/pollfish",
      logo: "/logos/pollfish.svg",
      size: "MEDIUM",
      founded: 2013,
      locations: JSON.stringify(["Athens", "New York City"]),
      technologies: JSON.stringify([
        "Python",
        "Go",
        "React",
        "GCP",
        "BigQuery",
        "Kubernetes",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "netdata",
      name: "Netdata",
      description:
        "Netdata is a popular open-source infrastructure monitoring platform that provides real-time performance metrics for servers, containers, and applications. Founded by a Greek team, it has become one of the most starred open-source monitoring projects on GitHub.",
      industry: "DevOps",
      website: "https://www.netdata.cloud",
      linkedinUrl: "https://www.linkedin.com/company/netdata-cloud",
      logo: "/logos/netdata.svg",
      size: "MEDIUM",
      founded: 2016,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "C",
        "Go",
        "React",
        "Kubernetes",
        "Prometheus",
        "eBPF",
      ]),
      status: "VERIFIED",
      featured: false,
      vcFunded: true,
    },
    {
      slug: "welcome-pickups",
      name: "Welcome Pickups",
      description:
        "Welcome Pickups offers personalized travel experiences with local hosts who provide airport pickups and curated tours. Founded in Athens, it has partnered with Booking.com and other major travel platforms to serve travelers in hundreds of destinations.",
      industry: "TravelTech",
      website: "https://www.welcomepickups.com",
      linkedinUrl: "https://www.linkedin.com/company/welcomepickups",
      logo: "/logos/welcome-pickups.svg",
      size: "SMALL",
      founded: 2015,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "Ruby on Rails",
        "React",
        "PostgreSQL",
        "Heroku",
        "Redis",
        "Sidekiq",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "athlenda",
      name: "Athlenda",
      description:
        "Athlenda is a sports technology startup building tools for amateur athletes and sports organizations to manage teams, leagues, and events. Based in Athens, the platform connects the grassroots sports community in Greece and beyond.",
      industry: "SportsTech",
      website: "https://www.athlenda.com",
      linkedinUrl: "https://www.linkedin.com/company/athlenda",
      logo: "/logos/athlenda.svg",
      size: "SMALL",
      founded: 2020,
      locations: JSON.stringify(["Athens"]),
      technologies: JSON.stringify([
        "React Native",
        "Node.js",
        "TypeScript",
        "Firebase",
        "GCP",
        "Flutter",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "instashop",
      name: "InstaShop / Delivery Hero",
      description:
        "InstaShop was a leading grocery and convenience delivery platform in the MENA region, founded by a Greek team. Acquired by Delivery Hero in 2020, its technology now powers rapid delivery services in Athens, Dubai, and beyond.",
      industry: "E-commerce",
      website: "https://www.instashop.com",
      linkedinUrl: "https://www.linkedin.com/company/instashop",
      logo: "/logos/instashop.svg",
      size: "MEDIUM",
      founded: 2015,
      locations: JSON.stringify(["Athens", "Dubai"]),
      technologies: JSON.stringify([
        "Node.js",
        "React Native",
        "MongoDB",
        "AWS",
        "Microservices",
        "Elasticsearch",
      ]),
      status: "AUTO_GENERATED",
      featured: false,
    },
    {
      slug: "stoiximan",
      name: "Stoiximan / Betano",
      description:
        "Stoiximan (Betano) is the leading online gaming and sports betting company in Greece and a fast-growing brand across Europe, Latin America, and Africa. Headquartered in Athens and Thessaloniki, it is part of Kaizen Gaming, one of the largest GameTech companies globally.",
      industry: "Gaming",
      website: "https://www.stoiximan.gr",
      linkedinUrl: "https://www.linkedin.com/company/kaaboradizen-gaming",
      logo: "/logos/stoiximan.svg",
      size: "LARGE",
      founded: 2012,
      locations: JSON.stringify(["Athens", "Thessaloniki"]),
      technologies: JSON.stringify([
        "Java",
        "React",
        "Kubernetes",
        "Kafka",
        "Cassandra",
        "Python",
      ]),
      status: "VERIFIED",
      featured: true,
    },
  ];

  const companyRecords: Record<string, { id: string }> = {};

  for (const company of companies) {
    const record = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: company,
    });
    companyRecords[company.slug] = record;
  }
  console.log(`✓ ${companies.length} companies seeded`);

  // ── 2b. Company Rep Claim ──────────────────────────────────────────────
  const workable = companyRecords["workable"];
  if (workable) {
    await prisma.companyClaim.upsert({
      where: { id: "seed-claim-workable" },
      update: {},
      create: {
        id: "seed-claim-workable",
        companyId: workable.id,
        userId: companyRep.id,
        fullName: "Nikos Georgiou",
        jobTitle: "Head of Talent Acquisition",
        workEmail: "nikos@workable.com",
        linkedinUrl: "https://linkedin.com/in/nikos-georgiou",
        status: "APPROVED",
        reviewedBy: admin.id,
        reviewNote: "Verified via seed data",
        reviewedAt: new Date(),
      },
    });

    await prisma.company.update({
      where: { id: workable.id },
      data: { status: "VERIFIED" },
    });
    console.log(`✓ Approved claim: ${companyRep.name} → Workable`);
  }

  // ── 3. Job Listings ───────────────────────────────────────────────────

  const jobs = [
    {
      companySlug: "workable",
      title: "Senior Frontend Engineer",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://www.workable.com/careers",
      description: "We're looking for a Senior Frontend Engineer to help build the next generation of our hiring platform. You'll work closely with product and design to ship polished, performant UI used by thousands of companies worldwide. Our frontend stack is modern and you'll have real ownership over architectural decisions.",
      requirements: JSON.stringify(["5+ years of frontend development experience", "Strong proficiency in React and TypeScript", "Experience with design systems and component libraries", "Familiarity with testing frameworks (Jest, Cypress)", "Excellent communication skills"]),
      techStack: JSON.stringify(["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"]),
      experienceLevel: "Senior",
    },
    {
      companySlug: "workable",
      title: "Staff Backend Engineer (Ruby)",
      location: "Remote (EU)",
      type: "REMOTE",
      externalUrl: "https://www.workable.com/careers",
      description: "Join our backend team to architect and scale the core services powering Workable's recruitment platform. You'll tackle complex distributed systems challenges, mentor engineers, and drive technical strategy across multiple teams. We process millions of applications and your work will directly impact how companies hire globally.",
      requirements: JSON.stringify(["8+ years of backend development experience", "Deep expertise in Ruby on Rails", "Experience designing and scaling distributed systems", "Strong understanding of PostgreSQL and Redis", "Track record of mentoring and technical leadership"]),
      techStack: JSON.stringify(["Ruby on Rails", "PostgreSQL", "Redis", "Elasticsearch", "AWS", "Docker"]),
      experienceLevel: "Staff",
    },
    {
      companySlug: "viva-wallet",
      title: "Java Software Engineer",
      location: "Athens, Greece",
      type: "ONSITE",
      externalUrl: "https://www.vivawallet.com/careers",
      description: "Build the payment infrastructure that powers thousands of merchants across Europe. As a Java Software Engineer at Viva Wallet, you'll develop high-throughput, low-latency services handling real-time financial transactions. Security, reliability, and performance are at the core of everything we do.",
      requirements: JSON.stringify(["3+ years of Java development experience", "Experience with Spring Boot and microservices", "Understanding of payment systems or fintech", "Strong problem-solving skills", "Knowledge of SQL and NoSQL databases"]),
      techStack: JSON.stringify(["Java", "Spring Boot", "Kafka", "PostgreSQL", "Kubernetes", "AWS"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "viva-wallet",
      title: "DevOps Engineer",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://www.vivawallet.com/careers",
      description: "Own and improve the infrastructure that keeps Europe's fastest-growing fintech running. You'll design CI/CD pipelines, manage cloud infrastructure at scale, and ensure our payment platform maintains 99.99% uptime. Work alongside security and engineering teams to build resilient, PCI-compliant systems.",
      requirements: JSON.stringify(["3+ years of DevOps/SRE experience", "Strong Kubernetes and Docker expertise", "Experience with Terraform or similar IaC tools", "Monitoring and observability (Prometheus, Grafana)", "Understanding of networking and security best practices"]),
      techStack: JSON.stringify(["Kubernetes", "Terraform", "AWS", "Docker", "Prometheus", "GitLab CI"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "blueground",
      title: "Full-Stack Developer (Python/React)",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://www.theblueground.com/careers",
      description: "Help us build the platform behind Blueground's global furnished apartment network. You'll work across the full stack, from React frontends used by guests and property managers to Python APIs that power search, booking, and operations. We're a small, fast-moving team where you'll ship features end-to-end.",
      requirements: JSON.stringify(["3+ years of full-stack development", "Experience with Python (Django or FastAPI)", "Strong React and TypeScript skills", "Familiarity with REST API design", "Comfortable working in an agile environment"]),
      techStack: JSON.stringify(["Python", "Django", "React", "TypeScript", "PostgreSQL", "AWS"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "skroutz",
      title: "Backend Engineer (Go)",
      location: "Athens, Greece",
      type: "ONSITE",
      externalUrl: "https://www.skroutz.gr/careers",
      description: "Skroutz serves millions of users daily and our backend needs to keep up. As a Backend Engineer, you'll build and optimize Go services that power product search, price comparison, and marketplace operations. You'll work on systems that handle massive traffic spikes and complex data pipelines.",
      requirements: JSON.stringify(["3+ years of backend development", "Experience with Go or willingness to learn quickly", "Strong understanding of data structures and algorithms", "Experience with high-traffic web applications", "Database optimization skills (MySQL, Redis)"]),
      techStack: JSON.stringify(["Go", "Ruby", "MySQL", "Redis", "Elasticsearch", "RabbitMQ"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "skroutz",
      title: "Data Engineer",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://www.skroutz.gr/careers",
      description: "Design and maintain the data infrastructure that drives insights for Greece's largest marketplace. You'll build ETL pipelines, manage data warehousing solutions, and enable data scientists and analysts to work with billions of product and user interaction records efficiently.",
      requirements: JSON.stringify(["3+ years of data engineering experience", "Proficiency in SQL and Python", "Experience with Apache Spark or similar", "Knowledge of data warehousing concepts", "Familiarity with workflow orchestration (Airflow)"]),
      techStack: JSON.stringify(["Python", "Apache Spark", "Airflow", "BigQuery", "Kafka", "dbt"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "epignosis",
      title: "PHP Developer",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://www.epignosishq.com/careers",
      description: "Join the team behind TalentLMS, one of the world's top learning management systems. You'll develop features used by millions of learners, work on API integrations, and help modernize our codebase. We value clean code, thoughtful architecture, and shipping things that make learning better.",
      requirements: JSON.stringify(["2+ years of PHP development", "Experience with Laravel or similar frameworks", "Frontend skills (HTML, CSS, JavaScript)", "Understanding of RESTful API design", "MySQL database experience"]),
      techStack: JSON.stringify(["PHP", "Laravel", "MySQL", "Vue.js", "Redis", "Docker"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "plum",
      title: "React Native Developer",
      location: "Remote (EU)",
      type: "REMOTE",
      externalUrl: "https://withplum.com/careers",
      description: "Build the mobile experience for Plum's AI-powered savings app used by over 2 million people. You'll own key features in our React Native app, from onboarding flows to investment dashboards. We move fast, ship weekly, and care deeply about crafting delightful user experiences on both iOS and Android.",
      requirements: JSON.stringify(["3+ years of React Native experience", "Published apps on App Store and Play Store", "Strong JavaScript/TypeScript skills", "Experience with state management (Redux, Zustand)", "Understanding of native modules and bridging"]),
      techStack: JSON.stringify(["React Native", "TypeScript", "Redux", "Firebase", "Jest", "Detox"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "persado",
      title: "Machine Learning Engineer",
      location: "Athens, Greece / NYC",
      type: "HYBRID",
      externalUrl: "https://www.persado.com/careers",
      description: "Apply cutting-edge NLP and generative AI to transform how brands communicate with their customers. At Persado, you'll build and deploy ML models that generate and optimize marketing language at scale. Your models will directly drive measurable revenue for Fortune 500 companies.",
      requirements: JSON.stringify(["3+ years of ML engineering experience", "Strong NLP background (transformers, LLMs)", "Proficiency in Python and ML frameworks", "Experience deploying models to production", "MS or PhD in Computer Science, ML, or related field preferred"]),
      techStack: JSON.stringify(["Python", "PyTorch", "Hugging Face", "AWS SageMaker", "Docker", "Kubernetes"]),
      experienceLevel: "Senior",
    },
    {
      companySlug: "hack-the-box",
      title: "Security Engineer",
      location: "Athens, Greece",
      type: "ONSITE",
      externalUrl: "https://www.hackthebox.com/careers",
      description: "Protect the platform that trains the world's cybersecurity professionals. As a Security Engineer at Hack The Box, you'll conduct security assessments, build detection systems, and help secure our infrastructure and web applications. You'll work with some of the sharpest security minds in the industry.",
      requirements: JSON.stringify(["3+ years of security engineering experience", "Hands-on penetration testing skills", "Experience with SIEM and security monitoring", "Knowledge of OWASP Top 10 and common attack vectors", "Security certifications (OSCP, CEH) are a plus"]),
      techStack: JSON.stringify(["Python", "Go", "Burp Suite", "Terraform", "AWS", "ELK Stack"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "hack-the-box",
      title: "Senior Go Developer",
      location: "Remote (Global)",
      type: "REMOTE",
      externalUrl: "https://www.hackthebox.com/careers",
      description: "Build the backend services that power Hack The Box's gamified cybersecurity training platform. You'll design and implement high-performance Go microservices, manage real-time lab environments, and work on systems that handle thousands of concurrent hacking challenges worldwide.",
      requirements: JSON.stringify(["5+ years of Go development experience", "Experience building microservices at scale", "Strong understanding of containerization and orchestration", "Knowledge of networking protocols and security", "Experience with real-time systems is a plus"]),
      techStack: JSON.stringify(["Go", "gRPC", "Kubernetes", "Docker", "PostgreSQL", "Redis"]),
      experienceLevel: "Senior",
    },
    {
      companySlug: "netdata",
      title: "C/C++ Systems Engineer",
      location: "Remote (Global)",
      type: "REMOTE",
      externalUrl: "https://www.netdata.cloud/careers",
      description: "Work on Netdata's open-source monitoring agent, installed on millions of servers worldwide. You'll write high-performance C code for real-time metrics collection, optimize memory usage, and build new collectors for emerging infrastructure. Your code runs everywhere from Raspberry Pis to enterprise data centers.",
      requirements: JSON.stringify(["5+ years of C/C++ development", "Systems programming experience (Linux)", "Understanding of operating system internals", "Performance optimization and profiling skills", "Open-source contribution experience is a plus"]),
      techStack: JSON.stringify(["C", "C++", "Linux", "Python", "Go", "Prometheus"]),
      experienceLevel: "Senior",
    },
    {
      companySlug: "stoiximan",
      title: "Senior Java Developer",
      location: "Athens, Greece",
      type: "ONSITE",
      externalUrl: "https://kaizengaming.com/careers",
      description: "Join Kaizen Gaming (Stoiximan/Betano) and build the technology behind one of Europe's fastest-growing gaming companies. You'll develop high-throughput Java services that process millions of real-time bets, handle live odds calculations, and power a seamless user experience across multiple markets.",
      requirements: JSON.stringify(["5+ years of Java development", "Experience with Spring ecosystem", "Microservices architecture expertise", "Understanding of event-driven systems", "Experience in gaming, fintech, or high-frequency systems preferred"]),
      techStack: JSON.stringify(["Java", "Spring Boot", "Kafka", "MongoDB", "Kubernetes", "Grafana"]),
      experienceLevel: "Senior",
    },
    {
      companySlug: "stoiximan",
      title: "Frontend Engineer (React)",
      location: "Thessaloniki, Greece",
      type: "HYBRID",
      externalUrl: "https://kaizengaming.com/careers",
      description: "Create smooth, real-time interfaces for millions of users across Stoiximan and Betano platforms. You'll build responsive web applications with complex state management for live sports data, work on performance optimization, and collaborate with UX to deliver best-in-class gaming experiences.",
      requirements: JSON.stringify(["3+ years of React development", "TypeScript proficiency", "Experience with real-time data and WebSockets", "Performance optimization skills", "Experience with micro-frontends is a plus"]),
      techStack: JSON.stringify(["React", "TypeScript", "Redux", "WebSocket", "Next.js", "Storybook"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "upstream",
      title: "Android Developer",
      location: "Athens, Greece",
      type: "ONSITE",
      externalUrl: "https://www.upstreamsystems.com/careers",
      description: "Build mobile marketing technology that reaches billions of users in emerging markets. At Upstream, you'll develop Android applications and SDKs that power mobile advertising, payments, and engagement platforms. Your work will run on devices across Africa, Latin America, and Southeast Asia.",
      requirements: JSON.stringify(["3+ years of Android development", "Strong Kotlin skills", "Experience with Android SDK and Jetpack libraries", "Understanding of mobile performance optimization", "Experience with CI/CD for mobile apps"]),
      techStack: JSON.stringify(["Kotlin", "Android SDK", "Jetpack Compose", "Retrofit", "Room", "Firebase"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "instashop",
      title: "Node.js Backend Developer",
      location: "Athens, Greece",
      type: "HYBRID",
      externalUrl: "https://careers.deliveryhero.com",
      description: "Build scalable backend services for InstaShop's grocery and convenience delivery platform, now part of Delivery Hero. You'll work on order management, real-time tracking, and inventory systems that serve customers across the Middle East and Greece. Fast-paced environment with direct product impact.",
      requirements: JSON.stringify(["2+ years of Node.js experience", "Experience with Express or NestJS", "MongoDB and Redis experience", "Understanding of event-driven architecture", "Experience with Docker and cloud services"]),
      techStack: JSON.stringify(["Node.js", "TypeScript", "NestJS", "MongoDB", "Redis", "AWS"]),
      experienceLevel: "Mid-level",
    },
    {
      companySlug: "intelligencia-ai",
      title: "Data Scientist (Clinical AI)",
      location: "Remote (EU/US)",
      type: "REMOTE",
      externalUrl: "https://www.intelligencia.ai/careers",
      description: "Use machine learning to predict clinical trial outcomes and transform drug development. At Intelligencia AI, you'll work with real-world pharmaceutical data, build predictive models for drug efficacy, and collaborate with domain experts to accelerate life-saving treatments. Your work directly impacts patients worldwide.",
      requirements: JSON.stringify(["3+ years of data science experience", "Strong statistical modeling and ML skills", "Experience with clinical or healthcare data preferred", "Proficiency in Python and R", "PhD or MS in a quantitative field preferred"]),
      techStack: JSON.stringify(["Python", "R", "scikit-learn", "TensorFlow", "SQL", "Jupyter"]),
      experienceLevel: "Senior",
    },
  ];

  // Clear existing jobs for idempotent seeding, then recreate
  await prisma.jobListing.deleteMany({});
  for (const job of jobs) {
    const companyId = companyRecords[job.companySlug]?.id;
    if (!companyId) {
      console.warn(`  ⚠ Company not found for slug: ${job.companySlug}`);
      continue;
    }
    await prisma.jobListing.create({
      data: {
        companyId,
        title: job.title,
        location: job.location,
        type: job.type,
        externalUrl: job.externalUrl,
        description: job.description || null,
        requirements: job.requirements || null,
        techStack: job.techStack || null,
        experienceLevel: job.experienceLevel || null,
        status: "ACTIVE",
      },
    });
  }
  console.log(`✓ ${jobs.length} job listings seeded`);

  // ── 4. Events ─────────────────────────────────────────────────────────

  const events = [
    {
      companySlug: "hack-the-box",
      title: "Capture the Flag: Spring Challenge 2026",
      description:
        "Join Hack The Box for an exciting CTF competition open to all skill levels. Solve cybersecurity challenges, compete with peers, and win prizes. Great networking opportunity for aspiring security professionals.",
      type: "WORKSHOP",
      date: new Date("2026-03-22T10:00:00Z"),
      startTime: "10:00",
      endTime: "18:00",
      location: "Innovathens, Pireos 100, Athens",
      isOnline: false,
      capacity: 150,
    },
    {
      companySlug: "workable",
      title: "Tech Hiring Trends in Greece — 2026 Insights",
      description:
        "Workable shares data-driven insights on the Greek tech hiring market: salary trends, in-demand skills, remote work adoption, and how to stand out as a candidate in 2026.",
      type: "WEBINAR",
      date: new Date("2026-03-28T17:00:00Z"),
      startTime: "17:00",
      endTime: "18:30",
      location: null,
      isOnline: true,
      registrationUrl: "https://www.workable.com/events",
      capacity: 500,
    },
    {
      companySlug: "stoiximan",
      title: "Kaizen Gaming Engineering Meetup",
      description:
        "Meet the engineering team behind Stoiximan/Betano. Talks on high-scale Java microservices, real-time data streaming with Kafka, and building resilient systems for millions of concurrent users.",
      type: "MEETUP",
      date: new Date("2026-04-03T18:30:00Z"),
      startTime: "18:30",
      endTime: "21:00",
      location: "Kaizen Gaming HQ, Athens",
      isOnline: false,
      capacity: 80,
    },
    {
      companySlug: "skroutz",
      title: "Open Source at Skroutz: From Rails to Go",
      description:
        "Skroutz engineers discuss their journey from a monolithic Rails app to a modern Go-based microservices architecture. Learn about the tradeoffs, tooling, and lessons learned along the way.",
      type: "MEETUP",
      date: new Date("2026-04-10T18:00:00Z"),
      startTime: "18:00",
      endTime: "20:30",
      location: "Skroutz HQ, Athens",
      isOnline: false,
      capacity: 60,
    },
    {
      companySlug: null,
      title: "Athens Tech Talent Fair — Spring 2026",
      description:
        "The largest tech career fair in Greece returns. Meet recruiters from 20+ companies, attend speed-interview sessions, and explore career opportunities across startups, scale-ups, and enterprises in the Greek tech ecosystem.",
      type: "TALENT_SESSION",
      date: new Date("2026-04-18T09:00:00Z"),
      startTime: "09:00",
      endTime: "17:00",
      location: "Megaron Athens International Conference Centre",
      isOnline: false,
      capacity: 1000,
    },
  ];

  // Clear existing events for idempotent seeding, then recreate
  await prisma.eventRegistration.deleteMany({});
  await prisma.event.deleteMany({});
  for (const event of events) {
    const companyId = event.companySlug
      ? companyRecords[event.companySlug]?.id ?? null
      : null;
    await prisma.event.create({
      data: {
        companyId,
        title: event.title,
        description: event.description,
        type: event.type,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        isOnline: event.isOnline,
        registrationUrl: event.registrationUrl ?? null,
        capacity: event.capacity,
      },
    });
  }
  console.log(`✓ ${events.length} events seeded`);

  // ── Summary ───────────────────────────────────────────────────────────

  const userCount = await prisma.user.count();
  const companyCount = await prisma.company.count();
  const jobCount = await prisma.jobListing.count();
  const eventCount = await prisma.event.count();

  console.log("\n--- Seed Summary ---");
  console.log(`Users:     ${userCount}`);
  console.log(`Companies: ${companyCount}`);
  console.log(`Jobs:      ${jobCount}`);
  console.log(`Events:    ${eventCount}`);
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
