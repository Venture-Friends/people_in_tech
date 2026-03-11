import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const claims = await prisma.companyClaim.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, slug: true, industry: true },
        },
        user: {
          select: { id: true, name: true, email: true },
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
    }));

    return NextResponse.json({ claims: mapped });
  } catch (error) {
    console.error("Admin claims GET error:", error);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}
