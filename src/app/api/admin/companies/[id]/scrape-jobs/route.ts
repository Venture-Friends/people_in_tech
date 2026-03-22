import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeJobs } from "@/lib/job-scraper";
import { findCareersUrl } from "@/lib/job-scraper/career-page-finder";
import { parseLinkedIn } from "@/lib/job-scraper/parsers/linkedin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const source = (body.source as string) || "careers";
    const careersUrlOverride = (body.careersUrl as string) || null;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        jobs: {
          select: { id: true, title: true, externalUrl: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check for duplicates: match by externalUrl or title+companyId
    const existingUrls = new Set(company.jobs.map((j) => j.externalUrl));
    const existingTitles = new Set(company.jobs.map((j) => j.title.toLowerCase()));

    if (source === "linkedin") {
      // LinkedIn scraping
      const linkedinUrl = company.linkedinUrl;
      if (!linkedinUrl) {
        return NextResponse.json(
          { error: "No LinkedIn URL found. Add a LinkedIn URL to this company first." },
          { status: 400 }
        );
      }

      const errors: string[] = [];
      let linkedInJobs: Awaited<ReturnType<typeof parseLinkedIn>> = [];

      try {
        linkedInJobs = await parseLinkedIn(linkedinUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
      }

      const jobsWithDuplicateInfo = linkedInJobs.map((job) => {
        const isDuplicate =
          existingUrls.has(job.url) ||
          existingTitles.has(job.title.toLowerCase());
        return { ...job, alreadyImported: isDuplicate };
      });

      // Log the scrape
      await prisma.jobScrapeLog.create({
        data: {
          companyId: id,
          careersUrl: linkedinUrl,
          jobsFound: linkedInJobs.length,
          jobsAdded: 0,
          errors: errors.length > 0 ? JSON.stringify(errors) : null,
        },
      });

      return NextResponse.json({
        careersUrl: linkedinUrl,
        source: "linkedin",
        scrapedAt: new Date().toISOString(),
        jobs: jobsWithDuplicateInfo,
        errors,
        existingJobCount: company.jobs.length,
      });
    }

    // Default: Careers page scraping
    let careersUrl = careersUrlOverride || company.careersUrl;

    if (!careersUrl && company.website) {
      careersUrl = await findCareersUrl(company.website);

      // Save discovered careers URL to company
      if (careersUrl) {
        await prisma.company.update({
          where: { id },
          data: { careersUrl },
        });
      }
    }

    if (!careersUrl) {
      return NextResponse.json(
        { error: "No careers URL found. Add a careers URL or website to this company." },
        { status: 400 }
      );
    }

    // If a careers URL override was provided, save it
    if (careersUrlOverride && careersUrlOverride !== company.careersUrl) {
      await prisma.company.update({
        where: { id },
        data: { careersUrl: careersUrlOverride },
      });
    }

    // Scrape jobs
    const result = await scrapeJobs(id, careersUrl);

    const jobsWithDuplicateInfo = result.jobs.map((job) => {
      const isDuplicate =
        existingUrls.has(job.url) ||
        existingTitles.has(job.title.toLowerCase());
      return { ...job, alreadyImported: isDuplicate };
    });

    // Log the scrape
    await prisma.jobScrapeLog.create({
      data: {
        companyId: id,
        careersUrl,
        jobsFound: result.jobs.length,
        jobsAdded: 0,
        errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
      },
    });

    return NextResponse.json({
      careersUrl,
      source: "careers",
      scrapedAt: result.scrapedAt.toISOString(),
      jobs: jobsWithDuplicateInfo,
      errors: result.errors,
      existingJobCount: company.jobs.length,
    });
  } catch (error) {
    console.error("Scrape jobs error:", error);
    return NextResponse.json(
      { error: "Failed to scrape jobs" },
      { status: 500 }
    );
  }
}
