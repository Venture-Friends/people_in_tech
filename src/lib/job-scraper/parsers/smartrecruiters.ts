import type { ScrapedJob } from "../types";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

interface SmartRecruitersJob {
  id: string;
  name: string;
  uuid: string;
  refNumber?: string;
  location: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
  };
  department?: { id: string; label: string };
  typeOfEmployment?: { id: string; label: string };
  experienceLevel?: { id: string; label: string };
  releasedDate?: string;
}

interface SmartRecruitersApiResponse {
  content: SmartRecruitersJob[];
  totalFound?: number;
}

// Alternate "more" API has a different shape
interface SmartRecruitersMoreResponse {
  postings?: SmartRecruitersMoreJob[];
  content?: SmartRecruitersJob[];
}

interface SmartRecruitersMoreJob {
  id: string;
  name: string;
  url?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
  };
  department?: string;
}

/**
 * Extracts the company identifier from SmartRecruiters URLs.
 *
 * Supported formats:
 * - https://careers.smartrecruiters.com/CompanyName
 * - https://careers.smartrecruiters.com/CompanyName/some-job
 * - https://jobs.smartrecruiters.com/CompanyName
 * - Custom domains like https://careers.deliveryhero.com (needs page fetch)
 */
function extractCompanyId(url: string): string | null {
  // Standard SmartRecruiters domain
  const standardMatch = url.match(
    /(?:careers|jobs)\.smartrecruiters\.com\/([^/?#]+)/i
  );
  if (standardMatch) return standardMatch[1];

  // Custom career domains — extract from path if it looks like a company careers page
  // e.g. careers.deliveryhero.com => try the domain's second-level name
  const customMatch = url.match(
    /careers\.([^.]+)\.[^/]+\/?$/i
  );
  if (customMatch) return customMatch[1];

  return null;
}

export async function parseSmartRecruiters(careersUrl: string): Promise<ScrapedJob[]> {
  const companyId = extractCompanyId(careersUrl);
  if (!companyId) {
    throw new Error(`Could not extract SmartRecruiters company ID from URL: ${careersUrl}`);
  }

  // Try the public postings API first
  try {
    return await parseSmartRecruitersApi(companyId);
  } catch {
    // Fallback to alternate API
    try {
      return await parseSmartRecruitersMore(companyId);
    } catch {
      throw new Error(`Failed to fetch jobs from SmartRecruiters for company: ${companyId}`);
    }
  }
}

async function parseSmartRecruitersApi(companyId: string): Promise<ScrapedJob[]> {
  const apiUrl = `https://api.smartrecruiters.com/v1/companies/${companyId}/postings`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`SmartRecruiters API returned ${res.status}`);
    }

    const data: SmartRecruitersApiResponse = await res.json();
    const jobs = data.content || [];

    return jobs.map((job): ScrapedJob => {
      const locationParts = [job.location?.city, job.location?.region, job.location?.country].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(", ") : null;

      return {
        title: job.name,
        url: `https://jobs.smartrecruiters.com/${companyId}/${job.id}`,
        location,
        type: inferType(location || "", job.location?.remote),
        department: job.department?.label || null,
        description: null,
        source: "smartrecruiters",
        confidence: "high",
      };
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseSmartRecruitersMore(companyId: string): Promise<ScrapedJob[]> {
  const apiUrl = `https://careers.smartrecruiters.com/${companyId}/api/more?offset=0&limit=100`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`SmartRecruiters more API returned ${res.status}`);
    }

    const data: SmartRecruitersMoreResponse = await res.json();

    // Handle "postings" array format
    if (data.postings && Array.isArray(data.postings)) {
      return data.postings.map((job): ScrapedJob => {
        const locationParts = [job.location?.city, job.location?.region, job.location?.country].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : null;

        return {
          title: job.name,
          url: job.url || `https://careers.smartrecruiters.com/${companyId}/${job.id}`,
          location,
          type: inferType(location || "", job.location?.remote),
          department: job.department || null,
          description: null,
          source: "smartrecruiters",
          confidence: "high",
        };
      });
    }

    // Handle "content" array format (same as main API)
    if (data.content && Array.isArray(data.content)) {
      return data.content.map((job): ScrapedJob => {
        const locationParts = [job.location?.city, job.location?.region, job.location?.country].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : null;

        return {
          title: job.name,
          url: `https://careers.smartrecruiters.com/${companyId}/${job.id}`,
          location,
          type: inferType(location || "", job.location?.remote),
          department: job.department?.label || null,
          description: null,
          source: "smartrecruiters",
          confidence: "high",
        };
      });
    }

    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function inferType(locationText: string, remote?: boolean): ScrapedJob["type"] {
  if (remote) return "REMOTE";
  const lower = locationText.toLowerCase();
  if (lower.includes("remote")) return "REMOTE";
  if (lower.includes("hybrid")) return "HYBRID";
  return null;
}
