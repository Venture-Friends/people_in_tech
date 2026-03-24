import * as cheerio from "cheerio";
import type { ScrapedJob } from "../types";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

interface WorkableJob {
  id: string;
  title: string;
  shortlink: string;
  city: string;
  state: string;
  country: string;
  department: string;
  telecommuting: boolean;
}

interface WorkableResponse {
  jobs: WorkableJob[];
}

function extractSlug(url: string): string | null {
  // apply.workable.com/companyname or apply.workable.com/companyname/j/...
  const match = url.match(/apply\.workable\.com\/([^/?#]+)/);
  return match ? match[1] : null;
}

export async function parseWorkable(url: string): Promise<ScrapedJob[]> {
  const slug = extractSlug(url);
  if (!slug) {
    throw new Error(`Could not extract Workable slug from URL: ${url}`);
  }

  // Try JSON API first
  try {
    return await parseWorkableApi(slug);
  } catch {
    // Fall back to HTML parsing
    return await parseWorkableHtml(url);
  }
}

async function parseWorkableApi(slug: string): Promise<ScrapedJob[]> {
  const apiUrl = `https://apply.workable.com/api/v1/widget/accounts/${slug}/jobs`;

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
      throw new Error(`Workable API returned ${res.status}`);
    }

    const data: WorkableResponse = await res.json();

    return data.jobs.map((job): ScrapedJob => {
      const locationParts = [job.city, job.state, job.country].filter(Boolean);
      const location = locationParts.length > 0 ? locationParts.join(", ") : null;

      return {
        title: job.title,
        url: job.shortlink || `https://apply.workable.com/${slug}/j/${job.id}`,
        location,
        type: job.telecommuting ? "REMOTE" : null,
        department: job.department || null,
        description: null,
        source: "workable",
        confidence: "high",
      };
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseWorkableHtml(url: string): Promise<ScrapedJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`Workable HTML page returned ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    // Workable renders job listings in various formats; look for common patterns
    $("[data-ui='job']").each((_, el) => {
      const $job = $(el);
      const title = $job.find("h3, [data-ui='job-title']").first().text().trim();
      const linkEl = $job.find("a[href]").first();
      const jobUrl = linkEl.attr("href") || "";
      const location = $job.find("[data-ui='job-location']").text().trim() || null;

      if (!title || !jobUrl) return;

      jobs.push({
        title,
        url: jobUrl.startsWith("http") ? jobUrl : new URL(jobUrl, url).href,
        location,
        type: inferType(location || ""),
        department: null,
        description: null,
        source: "workable",
        confidence: "high",
      });
    });

    return jobs;
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
