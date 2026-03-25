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
      description: j.description,
      externalUrl: j.externalUrl,
      status: j.status,
      postedAt: j.postedAt.toISOString(),
    }));

    return NextResponse.json({ jobs: mapped });
  } catch (error) {
    console.error("Admin jobs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { title, companyId, description, location, type, externalUrl } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json({ error: "Company is required" }, { status: 400 });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const job = await prisma.jobListing.create({
      data: {
        title: title.trim(),
        companyId,
        description: description?.trim() || null,
        location: location?.trim() || null,
        type: type || "ONSITE",
        externalUrl: externalUrl?.trim() || "",
        status: "ACTIVE",
      },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        companyName: job.company.name,
        companySlug: job.company.slug,
        location: job.location,
        type: job.type,
        status: job.status,
        postedAt: job.postedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin jobs POST error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
