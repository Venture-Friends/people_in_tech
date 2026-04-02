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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Admin company GET error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
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

    // All updatable Company fields
    const allowedFields = [
      "name", "industry", "website", "description", "linkedinUrl",
      "careersUrl", "logo", "coverImage", "size", "founded",
      "locations", "technologies", "featured", "vcFunded", "status",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Ensure founded is stored as an integer
    if (data.founded !== undefined && data.founded !== null) {
      data.founded = parseInt(String(data.founded), 10) || null;
    }

    const company = await prisma.company.update({
      where: { id },
      data,
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Admin company PUT error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
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
    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin company DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
