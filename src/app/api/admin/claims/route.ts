import { NextResponse } from "next/server";
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

    return NextResponse.json({ claims: mapped });
  } catch (error) {
    console.error("Admin claims GET error:", error);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}
