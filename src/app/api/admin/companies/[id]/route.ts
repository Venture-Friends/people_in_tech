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
    const { name, industry, featured, status } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (industry !== undefined) data.industry = industry;
    if (featured !== undefined) data.featured = featured;
    if (status !== undefined) data.status = status;

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
