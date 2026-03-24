import type { ScrapeResult } from "./types";
import { detectAndParse } from "./parsers";

export async function scrapeJobs(companyId: string, careersUrl: string): Promise<ScrapeResult> {
  const errors: string[] = [];
  const scrapedAt = new Date();

  try {
    const { jobs } = await detectAndParse(careersUrl);

    return {
      companyId,
      careersUrl,
      scrapedAt,
      jobs,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);

    return {
      companyId,
      careersUrl,
      scrapedAt,
      jobs: [],
      errors,
    };
  }
}

export type { ScrapedJob, ScrapeResult } from "./types";
