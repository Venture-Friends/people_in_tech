import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyForUser } from "@/lib/company-helpers";
import { getSession } from "@/lib/auth-session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const existingEvent = await prisma.event.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      isOnline,
      registrationUrl,
      capacity,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (location !== undefined) updateData.location = location;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (registrationUrl !== undefined)
      updateData.registrationUrl = registrationUrl;
    if (capacity !== undefined)
      updateData.capacity = capacity ? parseInt(capacity, 10) : null;

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const existingEvent = await prisma.event.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
