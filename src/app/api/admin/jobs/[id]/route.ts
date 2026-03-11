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
    const { status } = body;

    if (!status || !["ACTIVE", "PAUSED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'ACTIVE' or 'PAUSED'" },
        { status: 400 }
      );
    }

    const job = await prisma.jobListing.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Admin job PUT error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
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
    await prisma.jobListing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin job DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
