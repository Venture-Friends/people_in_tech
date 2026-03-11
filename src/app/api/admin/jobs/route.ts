import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search } },
          { company: { name: { contains: search } } },
        ],
      });
    }

    if (status) {
      conditions.push({ status });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const jobs = await prisma.jobListing.findMany({
      where,
      orderBy: { postedAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const mapped = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      companyName: j.company.name,
      companySlug: j.company.slug,
      location: j.location,
      type: j.type,
      status: j.status,
      postedAt: j.postedAt.toISOString(),
    }));

    return NextResponse.json({ jobs: mapped });
  } catch (error) {
    console.error("Admin jobs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
