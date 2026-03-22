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
          { name: { contains: search } },
          { industry: { contains: search } },
        ],
      });
    }

    if (status) {
      conditions.push({ status });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            followers: true,
            jobs: true,
          },
        },
      },
    });

    const mapped = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      industry: c.industry,
      website: c.website,
      description: c.description,
      linkedinUrl: c.linkedinUrl,
      careersUrl: c.careersUrl,
      logo: c.logo,
      coverImage: c.coverImage,
      size: c.size,
      founded: c.founded,
      locations: c.locations,
      technologies: c.technologies,
      status: c.status,
      featured: c.featured,
      followerCount: c._count.followers,
      jobCount: c._count.jobs,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ companies: mapped });
  } catch (error) {
    console.error("Admin companies GET error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, industry, website, description } = body;

    if (!name || !industry) {
      return NextResponse.json({ error: "Name and industry are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Company with similar name already exists" }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        industry,
        website: website || null,
        description: description || null,
        status: "AUTO_GENERATED",
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Admin companies POST error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
