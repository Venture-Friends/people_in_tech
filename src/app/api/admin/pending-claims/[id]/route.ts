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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { id } = await params;

    const pendingClaim = await prisma.pendingClaim.findUnique({
      where: { id },
    });

    if (!pendingClaim) {
      return NextResponse.json({ error: "Pending claim not found" }, { status: 404 });
    }

    await prisma.pendingClaim.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Pending claim dismissed.",
    });
  } catch (error) {
    console.error("Admin pending-claim DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete pending claim" }, { status: 500 });
  }
}
