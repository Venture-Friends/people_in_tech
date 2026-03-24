import * as cheerio from "cheerio";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 5000;

const COMMON_PATHS = [
  "/careers",
  "/jobs",
  "/join",
  "/join-us",
  "/work-with-us",
  "/careers/",
  "/jobs/",
];

const ATS_PATTERNS = [
  { pattern: "boards.greenhouse.io", name: "greenhouse" },
  { pattern: "jobs.lever.co", name: "lever" },
  { pattern: "apply.workable.com", name: "workable" },
] as const;

const CAREER_LINK_KEYWORDS = ["career", "jobs", "join", "hiring", "work with us", "openings", "vacancies"];

async function fetchWithTimeout(url: string, method: "HEAD" | "GET" = "HEAD"): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return "";
  }
}

export async function findCareersUrl(websiteUrl: string): Promise<string | null> {
  const baseUrl = websiteUrl.replace(/\/+$/, "");

  // Try common paths with HEAD requests
  for (const path of COMMON_PATHS) {
    const candidateUrl = `${baseUrl}${path}`;
    try {
      const res = await fetchWithTimeout(candidateUrl, "HEAD");
      if (res.ok) {
        return candidateUrl;
      }
    } catch {
      // Continue to next path
    }
  }

  // Parse homepage for career links and ATS links
  try {
    const res = await fetchWithTimeout(baseUrl, "GET");
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Check for ATS links first
    const allLinks: { href: string; text: string }[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim().toLowerCase();
      allLinks.push({ href, text });
    });

    // Detect ATS URLs
    for (const link of allLinks) {
      for (const ats of ATS_PATTERNS) {
        if (link.href.includes(ats.pattern)) {
          return link.href.startsWith("http") ? link.href : normalizeUrl(baseUrl, link.href);
        }
      }
    }

    // Check for career-related links on the page
    for (const link of allLinks) {
      const hrefLower = link.href.toLowerCase();
      const combined = `${hrefLower} ${link.text}`;

      for (const keyword of CAREER_LINK_KEYWORDS) {
        if (combined.includes(keyword)) {
          const fullUrl = link.href.startsWith("http")
            ? link.href
            : normalizeUrl(baseUrl, link.href);
          if (fullUrl) return fullUrl;
        }
      }
    }
  } catch {
    // Failed to parse homepage
  }

  return null;
}
