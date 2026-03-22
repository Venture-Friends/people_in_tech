import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build where clause
    const where: Record<string, unknown> = { status: "ACTIVE" };
    const conditions: Record<string, unknown>[] = [{ status: "ACTIVE" }];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search } },
          { location: { contains: search } },
          { company: { name: { contains: search } } },
        ],
      });
    }

    if (type && type !== "ALL") {
      conditions.push({ type });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Build orderBy
    let orderBy: Record<string, unknown> = {};
    switch (sort) {
      case "newest":
        orderBy = { postedAt: "desc" };
        break;
      case "oldest":
        orderBy = { postedAt: "asc" };
        break;
      case "company":
        orderBy = { company: { name: "asc" } };
        break;
      case "location":
        orderBy = { location: "asc" };
        break;
      default:
        orderBy = { postedAt: "desc" };
    }

    const [jobs, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
            },
          },
        },
      }),
      prisma.jobListing.count({ where }),
    ]);

    const mapped = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      type: j.type,
      externalUrl: j.externalUrl,
      postedAt: j.postedAt,
      company: {
        id: j.company.id,
        name: j.company.name,
        slug: j.company.slug,
        logo: j.company.logo,
        industry: j.company.industry,
      },
    }));

    return NextResponse.json({ jobs: mapped, total });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
