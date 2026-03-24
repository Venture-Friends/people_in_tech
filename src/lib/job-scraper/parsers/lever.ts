import * as cheerio from "cheerio";
import type { ScrapedJob } from "../types";

const USER_AGENT = "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)";
const TIMEOUT_MS = 10000;

export async function parseLever(url: string): Promise<ScrapedJob[]> {
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
      throw new Error(`Lever page returned ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $(".posting").each((_, el) => {
      const $posting = $(el);
      const title = $posting.find(".posting-title h5").text().trim();
      const location = $posting.find(".posting-categories .location").text().trim() || null;
      const department = $posting.find(".posting-categories .department").text().trim() || null;
      const linkEl = $posting.find(".posting-title a");
      const jobUrl = linkEl.attr("href") || "";

      if (!title || !jobUrl) return;

      jobs.push({
        title,
        url: jobUrl.startsWith("http") ? jobUrl : new URL(jobUrl, url).href,
        location,
        type: inferType(location || ""),
        department,
        description: null,
        source: "lever",
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
