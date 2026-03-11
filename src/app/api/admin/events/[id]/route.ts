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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, type, date, startTime, endTime, location, isOnline, capacity } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (date !== undefined) data.date = new Date(date);
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (location !== undefined) data.location = location;
    if (isOnline !== undefined) data.isOnline = isOnline;
    if (capacity !== undefined) data.capacity = capacity ? parseInt(capacity, 10) : null;

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Admin event PUT error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin event DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
