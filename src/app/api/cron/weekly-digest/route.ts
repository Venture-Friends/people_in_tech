import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get("x-cron-secret") ||
      request.nextUrl.searchParams.get("secret");

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get stats for the week
    const [newCompanies, newJobs, newEvents] = await Promise.all([
      prisma.company.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.jobListing.count({ where: { postedAt: { gte: oneWeekAgo }, status: "ACTIVE" } }),
      prisma.event.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    ]);

    // If nothing new, skip sending
    if (newCompanies === 0 && newJobs === 0 && newEvents === 0) {
      return NextResponse.json({ message: "No new content, skipping digest", sent: 0 });
    }

    // Get opted-in users
    const profiles = await prisma.candidateProfile.findMany({
      where: { emailDigest: true },
      include: { user: { select: { email: true, name: true } } },
    });

    if (profiles.length === 0) {
      return NextResponse.json({ message: "No subscribers", sent: 0 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { sendBatchEmail, generateUnsubscribeUrl } = await import("@/lib/email");
    const batch = profiles.map((profile) => ({
      to: profile.user.email,
      subject: "Your weekly digest — Hiring Partners",
      template: "weekly-digest" as const,
      data: {
        name: profile.user.name,
        newCompanies,
        newJobs,
        newEvents,
        digestUrl: `${appUrl}/discover`,
        unsubscribeUrl: generateUnsubscribeUrl(profile.user.email, "digest"),
      },
    }));

    const result = await sendBatchEmail(batch);

    return NextResponse.json({
      message: "Weekly digest sent",
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json(
      { error: "Failed to send weekly digest" },
      { status: 500 }
    );
  }
}
