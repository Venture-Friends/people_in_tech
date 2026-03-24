import * as cheerio from "cheerio";

export async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "HiringPartners-Bot/1.0 (+https://hiringpartners.gr)",
        Accept: "text/html",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function parseHtml(html: string) {
  return cheerio.load(html);
}
