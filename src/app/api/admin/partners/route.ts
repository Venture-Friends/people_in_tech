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
    const partners = await prisma.partner.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error("Admin partners GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, logo, website, order, active } = body;

    if (!name || !logo) {
      return NextResponse.json(
        { error: "Name and logo are required" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        logo,
        website: website || null,
        order: order !== undefined ? parseInt(String(order), 10) : 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (error) {
    console.error("Admin partners POST error:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
