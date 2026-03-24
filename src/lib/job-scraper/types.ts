export interface ScrapedJob {
  title: string;
  url: string;
  location: string | null;
  type: "REMOTE" | "HYBRID" | "ONSITE" | null;
  department: string | null;
  description: string | null;
  source: "greenhouse" | "lever" | "workable" | "linkedin" | "smartrecruiters" | "generic";
  confidence: "high" | "medium" | "low";
}

export interface ScrapeResult {
  companyId: string;
  careersUrl: string;
  scrapedAt: Date;
  jobs: ScrapedJob[];
  errors: string[];
}
