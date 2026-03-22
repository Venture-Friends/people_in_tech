import type { ScrapedJob } from "../types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const TIMEOUT_MS = 15000;

/**
 * Extracts a LinkedIn company identifier from various LinkedIn URL formats:
 * - https://www.linkedin.com/company/example-corp
 * - https://www.linkedin.com/company/example-corp/
 * - https://www.linkedin.com/company/example-corp/jobs/
 * - https://linkedin.com/company/example-corp
 */
function extractCompanySlug(url: string): string | null {
  const match = url.match(
    /linkedin\.com\/company\/([^/?#]+)/i
  );
  return match ? match[1] : null;
}

/**
 * Parse LinkedIn public company jobs page.
 *
 * LinkedIn's public job listing pages render job data in the HTML that can be
 * extracted via regex. We look for structured data (JSON-LD) and fallback to
 * HTML pattern matching for job titles and URLs.
 */
export async function parseLinkedIn(linkedinUrl: string): Promise<ScrapedJob[]> {
  const slug = extractCompanySlug(linkedinUrl);
  if (!slug) {
    throw new Error(
      `Could not extract LinkedIn company slug from URL: ${linkedinUrl}`
    );
  }

  // Build the jobs page URL
  const jobsPageUrl = `https://www.linkedin.com/company/${slug}/jobs/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(jobsPageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`LinkedIn returned HTTP ${res.status}`);
    }

    const html = await res.text();
    const jobs: ScrapedJob[] = [];
    const seen = new Set<string>();

    // Strategy 1: Look for JSON-LD structured data (JobPosting)
    const jsonLdPattern = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item["@type"] === "JobPosting" && item.title) {
            const jobUrl = item.url || item.sameAs || jobsPageUrl;
            if (!seen.has(jobUrl)) {
              seen.add(jobUrl);
              jobs.push({
                title: item.title,
                url: jobUrl,
                location: item.jobLocation?.address?.addressLocality || null,
                type: null,
                department: null,
                description: item.description
                  ? stripHtml(item.description).substring(0, 500)
                  : null,
                source: "linkedin",
                confidence: "high",
              });
            }
          }
        }
      } catch {
        // JSON parse failure, skip this block
      }
    }

    // Strategy 2: Look for job card patterns in the HTML
    // LinkedIn renders job listings with recognizable patterns
    const jobCardPattern =
      /href="(https?:\/\/(?:www\.)?linkedin\.com\/jobs\/view\/[^"]+)"[^>]*>[\s\S]*?<[^>]*class="[^"]*(?:job-card|base-card|result-card)[^"]*"[\s\S]*?<[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([^<]+)/gi;
    let cardMatch;
    while ((cardMatch = jobCardPattern.exec(html)) !== null) {
      const jobUrl = cardMatch[1];
      const title = cardMatch[2]?.trim();
      if (title && jobUrl && !seen.has(jobUrl)) {
        seen.add(jobUrl);
        jobs.push({
          title,
          url: jobUrl,
          location: null,
          type: null,
          department: null,
          description: null,
          source: "linkedin",
          confidence: "medium",
        });
      }
    }

    // Strategy 3: Broader pattern - look for any LinkedIn job view links with nearby text
    const jobViewPattern =
      /href="(https?:\/\/(?:www\.)?linkedin\.com\/jobs\/view\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let viewMatch;
    while ((viewMatch = jobViewPattern.exec(html)) !== null) {
      const jobUrl = viewMatch[1];
      const linkContent = stripHtml(viewMatch[2]).trim();
      if (linkContent && linkContent.length > 3 && linkContent.length < 200 && !seen.has(jobUrl)) {
        seen.add(jobUrl);
        jobs.push({
          title: linkContent,
          url: jobUrl,
          location: null,
          type: null,
          department: null,
          description: null,
          source: "linkedin",
          confidence: "medium",
        });
      }
    }

    // Strategy 4: Look for job titles in common LinkedIn HTML patterns
    // LinkedIn often has data in span/div elements near job links
    const titlePattern =
      /linkedin\.com\/jobs\/view\/([^"?]+)[^>]*>[\s\S]{0,200}?class="[^"]*(?:title|base-search-card__title)[^"]*"[^>]*>([^<]+)/gi;
    let titleMatch;
    while ((titleMatch = titlePattern.exec(html)) !== null) {
      const jobId = titleMatch[1];
      const title = titleMatch[2]?.trim();
      const jobUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
      if (title && !seen.has(jobUrl)) {
        seen.add(jobUrl);
        jobs.push({
          title,
          url: jobUrl,
          location: null,
          type: null,
          department: null,
          description: null,
          source: "linkedin",
          confidence: "medium",
        });
      }
    }

    return jobs;
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
