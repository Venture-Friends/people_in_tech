import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const userId = (session.user as { id: string }).id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if registration exists
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      // Unregister
      await prisma.eventRegistration.delete({
        where: { id: existingRegistration.id },
      });
    } else {
      // Register
      await prisma.eventRegistration.create({
        data: {
          userId,
          eventId,
        },
      });
    }

    // Get updated registration count
    const registrationCount = await prisma.eventRegistration.count({
      where: { eventId },
    });

    return NextResponse.json({
      registered: !existingRegistration,
      registrationCount,
    });
  } catch (error) {
    console.error("Error toggling event registration:", error);
    return NextResponse.json(
      { error: "Failed to toggle registration" },
      { status: 500 }
    );
  }
}
