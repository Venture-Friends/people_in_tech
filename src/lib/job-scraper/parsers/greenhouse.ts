import type { ScrapedJob } from "../types";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string } | null;
  departments: { name: string }[];
  updated_at: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

function extractBoardSlug(url: string): string | null {
  // boards.greenhouse.io/companyname or boards.greenhouse.io/companyname/jobs/123
  const match = url.match(/boards\.greenhouse\.io\/([^/?#]+)/);
  return match ? match[1] : null;
}

export async function parseGreenhouse(boardUrl: string): Promise<ScrapedJob[]> {
  const slug = extractBoardSlug(boardUrl);
  if (!slug) {
    throw new Error(`Could not extract Greenhouse board slug from URL: ${boardUrl}`);
  }

  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;

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
      throw new Error(`Greenhouse API returned ${res.status}`);
    }

    const data: GreenhouseResponse = await res.json();

    return data.jobs.map((job): ScrapedJob => ({
      title: job.title,
      url: job.absolute_url,
      location: job.location?.name || null,
      type: inferType(job.location?.name || ""),
      department: job.departments?.[0]?.name || null,
      description: null,
      source: "greenhouse",
      confidence: "high",
    }));
  } finally {
    clearTimeout(timeout);
  }
}

function inferType(locationText: string): ScrapedJob["type"] {
  const lower = locationText.toLowerCase();
  if (lower.includes("remote")) return "REMOTE";
  if (lower.includes("hybrid")) return "HYBRID";
  return null;
}
