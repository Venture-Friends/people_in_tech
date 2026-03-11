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
    const { action } = body;

    if (action === "send") {
      // Mock send: count candidates and mark as sent
      const candidateCount = await prisma.user.count({
        where: { role: "CANDIDATE" },
      });

      const newsletter = await prisma.newsletter.update({
        where: { id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          recipientCount: candidateCount,
        },
      });

      return NextResponse.json({
        newsletter,
        message: `Newsletter sent to ${candidateCount} candidates (mock).`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin newsletter PUT error:", error);
    return NextResponse.json({ error: "Failed to update newsletter" }, { status: 500 });
  }
}
