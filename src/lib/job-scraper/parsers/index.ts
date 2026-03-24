import * as cheerio from "cheerio";
import type { ScrapedJob } from "../types";
import { parseGreenhouse } from "./greenhouse";
import { parseLever } from "./lever";
import { parseWorkable } from "./workable";
import { parseSmartRecruiters } from "./smartrecruiters";
import { parseGeneric } from "./generic";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

const ATS_DETECTORS: {
  pattern: RegExp;
  name: string;
  parse: (url: string) => Promise<ScrapedJob[]>;
}[] = [
  {
    pattern: /boards\.greenhouse\.io/i,
    name: "greenhouse",
    parse: parseGreenhouse,
  },
  {
    pattern: /jobs\.lever\.co/i,
    name: "lever",
    parse: parseLever,
  },
  {
    pattern: /apply\.workable\.com/i,
    name: "workable",
    parse: parseWorkable,
  },
  {
    pattern: /(?:jobs|careers)\.smartrecruiters\.com/i,
    name: "smartrecruiters",
    parse: parseSmartRecruiters,
  },
  {
    pattern: /careers\.[^.]+\.com\/(?:jobs|search|postings)/i,
    name: "smartrecruiters",
    parse: parseSmartRecruiters,
  },
];

export async function detectAndParse(url: string): Promise<{ source: string; jobs: ScrapedJob[] }> {
  // Check URL itself for ATS patterns
  for (const detector of ATS_DETECTORS) {
    if (detector.pattern.test(url)) {
      const jobs = await detector.parse(url);
      return { source: detector.name, jobs };
    }
  }

  // Fetch page and check HTML for ATS links
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html",
        },
      });
      if (!res.ok) {
        throw new Error(`Page returned ${res.status}`);
      }
      html = await res.text();
    } finally {
      clearTimeout(timeout);
    }

    const $ = cheerio.load(html);

    // Look for ATS links in the page
    const allHrefs: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      allHrefs.push(href);
    });

    // Also check iframes (some sites embed ATS in iframes)
    $("iframe[src]").each((_, el) => {
      const src = $(el).attr("src") || "";
      allHrefs.push(src);
    });

    for (const href of allHrefs) {
      for (const detector of ATS_DETECTORS) {
        if (detector.pattern.test(href)) {
          const atsUrl = href.startsWith("http") ? href : new URL(href, url).href;
          const jobs = await detector.parse(atsUrl);
          return { source: detector.name, jobs };
        }
      }
    }
  } catch {
    // If we can't fetch the page for ATS detection, fall through to generic
  }

  // Fallback to generic parsing
  const jobs = await parseGeneric(url);
  return { source: "generic", jobs };
}
