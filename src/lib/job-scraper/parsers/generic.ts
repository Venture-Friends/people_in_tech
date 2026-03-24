import * as cheerio from "cheerio";
import type { ScrapedJob } from "../types";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

// URL patterns that suggest a link points to a job posting
const JOB_URL_TERMS = [
  "/apply",
  "/position",
  "/role",
  "/job/",
  "/jobs/",
  "/opening",
  "/vacancy",
  "/career",
];

// Title patterns that suggest a link text is a job title
const JOB_TITLE_PATTERNS = [
  /\bsenior\b/i,
  /\bjunior\b/i,
  /\bengineer\b/i,
  /\bmanager\b/i,
  /\bdesigner\b/i,
  /\bdeveloper\b/i,
  /\banalyst\b/i,
  /\blead\b/i,
  /\bdirector\b/i,
  /\barchitect\b/i,
  /\bconsultant\b/i,
  /\bspecialist\b/i,
  /\bcoordinator\b/i,
  /\bintern\b/i,
  /\bhead of\b/i,
  /\bvp\b/i,
  /\bfull.?stack\b/i,
  /\bfront.?end\b/i,
  /\bback.?end\b/i,
  /\bdevops\b/i,
  /\bqa\b/i,
  /\bproduct\b/i,
  /\bdata\b/i,
  /\bsoftware\b/i,
];

interface ScoredLink {
  title: string;
  url: string;
  score: number;
  nearbyText: string;
}

export async function parseGeneric(url: string): Promise<ScrapedJob[]> {
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
      throw new Error(`Generic page returned ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const scoredLinks: ScoredLink[] = [];

    $("a[href]").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") || "";
      const text = $el.text().trim();

      // Skip navigation, footer, and short links
      if (!text || text.length < 3 || text.length > 200) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href === "/" || href === url) return;

      let score = 0;

      // Score: URL contains job terms
      const hrefLower = href.toLowerCase();
      for (const term of JOB_URL_TERMS) {
        if (hrefLower.includes(term)) {
          score++;
          break;
        }
      }

      // Score: link text matches job title patterns
      let titlePatternMatches = 0;
      for (const pattern of JOB_TITLE_PATTERNS) {
        if (pattern.test(text)) {
          titlePatternMatches++;
        }
      }
      if (titlePatternMatches > 0) score += Math.min(titlePatternMatches, 2);

      // Score: nearby text contains location or type info
      const parent = $el.parent();
      const nearbyText = parent.text().trim().substring(0, 500);

      // Score: parent or sibling has location-like text
      if (/\b(athens|thessaloniki|greece|remote|hybrid|onsite|on-site)\b/i.test(nearbyText)) {
        score++;
      }

      if (score >= 1) {
        scoredLinks.push({
          title: text,
          url: href.startsWith("http") ? href : safeResolveUrl(url, href),
          score,
          nearbyText,
        });
      }
    });

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = scoredLinks.filter((link) => {
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    });

    // Sort by score descending
    unique.sort((a, b) => b.score - a.score);

    // Take top results
    return unique.slice(0, 50).map((link): ScrapedJob => ({
      title: link.title,
      url: link.url,
      location: extractLocation(link.nearbyText),
      type: inferType(link.nearbyText),
      department: null,
      description: null,
      source: "generic",
      confidence: link.score >= 3 ? "high" : link.score >= 2 ? "medium" : "low",
    }));
  } finally {
    clearTimeout(timeout);
  }
}

function safeResolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

function extractLocation(text: string): string | null {
  const locationPatterns = [
    /\b(athens|thessaloniki|patras|heraklion|larissa|volos)\b/i,
    /\b(greece|cyprus|london|berlin|amsterdam|new york|san francisco)\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function inferType(text: string): ScrapedJob["type"] {
  const lower = text.toLowerCase();
  if (/\bremote\b/.test(lower)) return "REMOTE";
  if (/\bhybrid\b/.test(lower)) return "HYBRID";
  if (/\b(on-?site|onsite)\b/.test(lower)) return "ONSITE";
  return null;
}
