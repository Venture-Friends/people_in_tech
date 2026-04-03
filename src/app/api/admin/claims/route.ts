import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const where = status === "ALL" ? {} : { status };

    const claims = await prisma.companyClaim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, slug: true, industry: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { name: true },
        },
      },
    });

    const mapped = claims.map((c) => ({
      id: c.id,
      source: "claim" as const,
      companyId: c.companyId,
      companyName: c.company.name,
      companySlug: c.company.slug,
      companyIndustry: c.company.industry,
      userId: c.userId,
      userName: c.user.name,
      userEmail: c.user.email,
      fullName: c.fullName,
      jobTitle: c.jobTitle,
      workEmail: c.workEmail,
      linkedinUrl: c.linkedinUrl,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      reviewerName: c.reviewer?.name || null,
      reviewNote: c.reviewNote || null,
      reviewedAt: c.reviewedAt?.toISOString() || null,
    }));

    // Also fetch unverified PendingClaim records (from non-auth public claims)
    let pendingMapped: typeof mapped = [];
    if (status === "PENDING" || status === "ALL") {
      const pendingVerifications = await prisma.pendingClaim.findMany({
        where: { verified: false },
        orderBy: { createdAt: "desc" },
        include: { company: { select: { id: true, name: true, slug: true, industry: true } } },
      });
      pendingMapped = pendingVerifications.map((p) => ({
        id: `pending-${p.id}`,
        source: "pending" as const,
        companyId: p.companyId,
        companyName: p.company.name,
        companySlug: p.company.slug,
        companyIndustry: p.company.industry,
        userId: null,
        userName: null,
        userEmail: null,
        fullName: p.fullName,
        jobTitle: p.jobTitle,
        workEmail: p.workEmail,
        linkedinUrl: p.linkedinUrl,
        message: p.message,
        status: "PENDING",
        createdAt: p.createdAt.toISOString(),
        reviewerName: null,
        reviewNote: null,
        reviewedAt: null,
      }));
    }

    const allClaims = [...mapped, ...pendingMapped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Also fetch listing requests (PENDING companies with contactInfo, no CompanyClaim)
    const listingRequests = await prisma.company.findMany({
      where: { status: "PENDING", contactInfo: { not: Prisma.DbNull } },
      orderBy: { createdAt: "desc" },
    });

    const mappedListingRequests = listingRequests.map((c) => ({
      id: c.id,
      type: "LISTING_REQUEST" as const,
      companyName: c.name,
      companySlug: c.slug,
      website: c.website,
      contactInfo: c.contactInfo as Record<string, string | null>,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ claims: allClaims, listingRequests: mappedListingRequests });
  } catch (error) {
    console.error("Admin claims GET error:", error);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}
