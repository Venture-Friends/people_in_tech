// Shared onboarding/profile constants — single source of truth

export const EXPERIENCE_LEVELS = {
  ic: [
    { value: "STUDENT", labelKey: "expStudent", descKey: "expStudentDesc", years: "0" },
    { value: "FRESH_GRADUATE", labelKey: "expFreshGraduate", descKey: "expFreshGraduateDesc", years: "0–1" },
    { value: "JUNIOR", labelKey: "expJunior", descKey: "expJuniorDesc", years: "1–2" },
    { value: "MID", labelKey: "expMid", descKey: "expMidDesc", years: "3–4" },
    { value: "SENIOR", labelKey: "expSenior", descKey: "expSeniorDesc", years: "5–8" },
    { value: "LEAD", labelKey: "expLead", descKey: "expLeadDesc", years: "6–10" },
    { value: "STAFF", labelKey: "expStaff", descKey: "expStaffDesc", years: "8+" },
  ],
  management: [
    { value: "MANAGER", labelKey: "expManager", descKey: "expManagerDesc", years: "5+" },
    { value: "DIRECTOR", labelKey: "expDirector", descKey: "expDirectorDesc", years: "10+" },
    { value: "EXECUTIVE", labelKey: "expExecutive", descKey: "expExecutiveDesc", years: "12+" },
  ],
} as const;

// Direct label lookup for non-translated contexts (e.g., profile settings)
export const EXPERIENCE_LABEL_MAP: Record<string, string> = {
  STUDENT: "Student",
  FRESH_GRADUATE: "Fresh Graduate",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  STAFF: "Staff / Principal",
  MANAGER: "Manager",
  DIRECTOR: "Director",
  EXECUTIVE: "Executive / C-Level",
};

export const ALL_EXPERIENCE_VALUES = [
  ...EXPERIENCE_LEVELS.ic.map((l) => l.value),
  ...EXPERIENCE_LEVELS.management.map((l) => l.value),
] as const;

export const ROLE_GROUPS = {
  Technical: [
    "Software Engineering",
    "DevOps & Infrastructure",
    "Data Engineering",
    "Data Science & Analytics",
    "Security Engineering",
    "QA & Testing",
  ],
  "Product & Design": [
    "Design",
    "Product Management",
    "Engineering Management",
  ],
  Business: [
    "Marketing & Growth",
    "Sales & Business Dev",
    "Customer Success & Support",
    "Operations & Strategy",
    "Finance, Legal & Compliance",
    "People, HR & Recruitment",
    "Other",
  ],
} as const;

export const ALL_ROLES = Object.values(ROLE_GROUPS).flat();
export const MAX_ROLE_SELECTIONS = 5;

export const SKILL_CATEGORIES = {
  Frontend: ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS"],
  Backend: ["Node.js", "Python", "Java", "Go", "Rust", "Ruby", "PHP", "C#/.NET", "Django", "Spring Boot", "REST APIs", "GraphQL"],
  Mobile: ["React Native", "Flutter", "Swift/iOS", "Kotlin/Android"],
  DevOps: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Linux", "GitHub Actions"],
  "Data & ML/AI": ["SQL", "Python (Data)", "Pandas", "TensorFlow", "PyTorch", "Spark", "dbt", "LLMs/GenAI"],
  Security: ["Application Security", "Penetration Testing", "Compliance/GRC"],
  QA: ["Test Automation", "Cypress", "Playwright", "API Testing"],
  Design: ["UI Design", "UX Design", "UX Research", "Product Design", "Figma", "Design Systems"],
  "Product & Mgmt": ["Product Management", "Agile/Scrum", "Product Analytics", "Engineering Management"],
  Marketing: ["Digital Marketing", "SEO", "Content Marketing", "Growth Hacking", "CRM"],
  "Sales & BD": ["B2B Sales", "SaaS Sales", "Account Management", "Business Development"],
  Operations: ["Project Management", "People Operations/HR", "Customer Success", "Financial Analysis"],
} as const;

export const INDUSTRY_OPTIONS = [
  "AI/ML",
  "Consulting",
  "Cybersecurity",
  "E-commerce",
  "EdTech",
  "FinTech",
  "Gaming",
  "GreenTech",
  "HealthTech",
  "IoT",
  "Logistics",
  "Media",
  "PropTech",
  "SaaS",
  "Telecom",
  "TravelTech",
];

export const LOCATION_OPTIONS = [
  "Athens",
  "Thessaloniki",
  "Patras",
  "Heraklion",
  "Larissa",
  "Remote",
  "Hybrid",
  "Anywhere in Greece",
];
