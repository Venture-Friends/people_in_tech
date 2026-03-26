import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

async function requireAdmin() {
  const session = await getSession();
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
    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    const mapped = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      date: e.date.toISOString(),
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      isOnline: e.isOnline,
      capacity: e.capacity,
      registrationUrl: e.registrationUrl,
      companyId: e.companyId,
      companyName: e.company?.name || "Platform Event",
      registrations: e._count.registrations,
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({ events: mapped });
  } catch (error) {
    console.error("Admin events GET error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { title, description, type, date, startTime, endTime, location, isOnline, capacity, registrationUrl } = body;

    if (!title || !date || !startTime) {
      return NextResponse.json(
        { error: "Title, date, and start time are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type: type || "WORKSHOP",
        date: new Date(date),
        startTime,
        endTime: endTime || null,
        location: location || null,
        isOnline: isOnline || false,
        capacity: capacity ? parseInt(capacity, 10) : null,
        registrationUrl: registrationUrl || null,
        companyId: null, // Platform event
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Admin events POST error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
