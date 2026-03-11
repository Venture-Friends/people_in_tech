import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyForUser } from "@/lib/company-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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

    return NextResponse.json({
      id: company.id,
      slug: company.slug,
      name: company.name,
      description: company.description,
      industry: company.industry,
      website: company.website,
      linkedinUrl: company.linkedinUrl,
      logo: company.logo,
      coverImage: company.coverImage,
      size: company.size,
      founded: company.founded,
      locations: company.locations,
      technologies: company.technologies,
      status: company.status,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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

    const {
      name,
      description,
      industry,
      website,
      linkedinUrl,
      logo,
      coverImage,
      size,
      founded,
      locations,
      technologies,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (industry !== undefined) updateData.industry = industry;
    if (website !== undefined) updateData.website = website;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (logo !== undefined) updateData.logo = logo;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (size !== undefined) updateData.size = size;
    if (founded !== undefined)
      updateData.founded = founded ? parseInt(founded, 10) : null;

    // Store arrays as JSON strings for SQLite
    if (locations !== undefined) {
      updateData.locations = Array.isArray(locations)
        ? JSON.stringify(locations)
        : locations;
    }
    if (technologies !== undefined) {
      updateData.technologies = Array.isArray(technologies)
        ? JSON.stringify(technologies)
        : technologies;
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      industry: updated.industry,
      website: updated.website,
      linkedinUrl: updated.linkedinUrl,
      logo: updated.logo,
      coverImage: updated.coverImage,
      size: updated.size,
      founded: updated.founded,
      locations: updated.locations,
      technologies: updated.technologies,
      status: updated.status,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile" },
      { status: 500 }
    );
  }
}
