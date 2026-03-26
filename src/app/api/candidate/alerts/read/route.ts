import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.candidateProfile.update({
      where: { userId: session.user.id },
      data: { lastSeenAlertsAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking alerts as read:", error);
    return NextResponse.json(
      { error: "Failed to mark alerts as read" },
      { status: 500 }
    );
  }
}
