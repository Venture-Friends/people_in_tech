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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { name: true },
        },
      },
    });

    const mapped = newsletters.map((n) => ({
      id: n.id,
      subject: n.subject,
      content: n.content,
      status: n.status,
      sentAt: n.sentAt?.toISOString() || null,
      recipientCount: n.recipientCount,
      createdBy: n.creator.name,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ newsletters: mapped });
  } catch (error) {
    console.error("Admin newsletters GET error:", error);
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const session = auth.session!;
    const body = await request.json();
    const { subject, content } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content,
        status: "DRAFT",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ newsletter }, { status: 201 });
  } catch (error) {
    console.error("Admin newsletters POST error:", error);
    return NextResponse.json({ error: "Failed to create newsletter" }, { status: 500 });
  }
}
