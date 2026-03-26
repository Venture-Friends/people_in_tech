import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ScrapedJob } from "@/lib/job-scraper/types";
import { getSession } from "@/lib/auth-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const { jobs } = body as { jobs: ScrapedJob[] };

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: "No jobs provided" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (const job of jobs) {
      try {
        // Check if job already exists by URL
        const existing = await prisma.jobListing.findFirst({
          where: {
            companyId: id,
            OR: [
              { externalUrl: job.url },
              { title: job.title },
            ],
          },
        });

        if (existing) {
          errors.push(`Skipped duplicate: "${job.title}"`);
          continue;
        }

        await prisma.jobListing.create({
          data: {
            companyId: id,
            title: job.title,
            location: job.location,
            type: job.type || "ONSITE",
            externalUrl: job.url,
            description: job.description,
            status: "ACTIVE",
            postedAt: new Date(),
          },
        });

        importedCount++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to import "${job.title}": ${message}`);
      }
    }

    // Update the most recent scrape log with the imported count
    const latestLog = await prisma.jobScrapeLog.findFirst({
      where: { companyId: id },
      orderBy: { scrapedAt: "desc" },
    });

    if (latestLog) {
      await prisma.jobScrapeLog.update({
        where: { id: latestLog.id },
        data: { jobsAdded: importedCount },
      });
    }

    return NextResponse.json({
      imported: importedCount,
      skipped: jobs.length - importedCount,
      errors,
    });
  } catch (error) {
    console.error("Import jobs error:", error);
    return NextResponse.json(
      { error: "Failed to import jobs" },
      { status: 500 }
    );
  }
}
