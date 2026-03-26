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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingSave = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingSave) {
      await prisma.savedEvent.delete({
        where: { id: existingSave.id },
      });
    } else {
      await prisma.savedEvent.create({
        data: {
          userId,
          eventId,
        },
      });
    }

    return NextResponse.json({
      saved: !existingSave,
    });
  } catch (error) {
    console.error("Error toggling saved event:", error);
    return NextResponse.json(
      { error: "Failed to toggle saved event" },
      { status: 500 }
    );
  }
}
