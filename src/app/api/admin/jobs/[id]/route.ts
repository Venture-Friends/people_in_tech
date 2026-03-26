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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await params;
    const { status, title, description, location, type, externalUrl } = await request.json();

    // Only validate status if it's provided
    if (status !== undefined && !["ACTIVE", "PAUSED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'ACTIVE' or 'PAUSED'" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (location !== undefined) data.location = location;
    if (type !== undefined) data.type = type;
    if (externalUrl !== undefined) data.externalUrl = externalUrl;

    const job = await prisma.jobListing.update({
      where: { id },
      data,
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
