import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyForUser } from "@/lib/company-helpers";
import { getSession } from "@/lib/auth-session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY_REP") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await getCompanyForUser(session.user.id);
    if (!company) {
      return NextResponse.json(
        { error: "No approved company claim found" },
        { status: 404 }
      );
    }

    const jobs = await prisma.jobListing.findMany({
      where: { companyId: company.id },
      orderBy: { postedAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY_REP") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await getCompanyForUser(session.user.id);
    if (!company) {
      return NextResponse.json(
        { error: "No approved company claim found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, location, type, externalUrl } = body;

    if (!title || !externalUrl) {
      return NextResponse.json(
        { error: "Title and external URL are required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobListing.create({
      data: {
        companyId: company.id,
        title,
        location: location || null,
        type: type || "ONSITE",
        externalUrl,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
