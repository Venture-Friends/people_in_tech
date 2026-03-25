// Shared onboarding/profile constants — single source of truth

export const EXPERIENCE_LEVELS = [
  { value: "STUDENT", labelKey: "levelStudent", years: "0" },
  { value: "JUNIOR", labelKey: "levelJunior", years: "0–2" },
  { value: "MID", labelKey: "levelMid", years: "3–5" },
  { value: "SENIOR", labelKey: "levelSenior", years: "5–8" },
  { value: "LEAD", labelKey: "levelLead", years: "8+" },
  { value: "MANAGER", labelKey: "levelManager", years: "5+" },
  { value: "DIRECTOR", labelKey: "levelDirector", years: "10+" },
] as const;

// Direct label lookup for non-translated contexts (e.g., profile settings)
export const EXPERIENCE_LABEL_MAP: Record<string, string> = {
  STUDENT: "Student",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
  DIRECTOR: "Director",
};

export const ALL_EXPERIENCE_VALUES = EXPERIENCE_LEVELS.map((l) => l.value);

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
  "AI/ML", "Consulting", "Cybersecurity", "E-commerce", "EdTech", "FinTech",
  "Gaming", "GreenTech", "HealthTech", "IoT", "Logistics", "Media",
  "PropTech", "SaaS", "Telecom", "TravelTech",
];

export const LOCATION_OPTIONS = [
  "Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa",
  "Remote", "Hybrid", "Anywhere in Greece",
];
