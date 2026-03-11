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

    const images = await prisma.galleryImage.findMany({
      where: { companyId: company.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { url, caption } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Get the next order number
    const lastImage = await prisma.galleryImage.findFirst({
      where: { companyId: company.id },
      orderBy: { order: "desc" },
    });

    const image = await prisma.galleryImage.create({
      data: {
        companyId: company.id,
        url,
        caption: caption || null,
        order: (lastImage?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error adding gallery image:", error);
    return NextResponse.json(
      { error: "Failed to add gallery image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const existingImage = await prisma.galleryImage.findFirst({
      where: { id: imageId, companyId: company.id },
    });

    if (!existingImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await prisma.galleryImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery image" },
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
    const { id, caption, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const existingImage = await prisma.galleryImage.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existingImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = order;

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { error: "Failed to update gallery image" },
      { status: 500 }
    );
  }
}
