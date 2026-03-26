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

    const events = await prisma.event.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
      include: {
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
      registrationUrl: e.registrationUrl,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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

    if (!title || !date || !startTime) {
      return NextResponse.json(
        { error: "Title, date, and start time are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        companyId: company.id,
        title,
        description: description || null,
        type: type || "WORKSHOP",
        date: new Date(date),
        startTime,
        endTime: endTime || null,
        location: location || null,
        isOnline: isOnline ?? false,
        registrationUrl: registrationUrl || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
