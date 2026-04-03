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
    const body = await request.json();
    const { action, reviewNote } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.status !== "PENDING") {
      return NextResponse.json(
        { error: "This listing request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve: set company status to AUTO_GENERATED (normal listed company)
      await prisma.company.update({
        where: { id },
        data: { status: "AUTO_GENERATED" },
      });

      return NextResponse.json({
        success: true,
        message: "Listing request approved. Company is now listed.",
      });
    } else {
      // Reject: delete the placeholder company record
      await prisma.company.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Listing request rejected and company record removed.",
      });
    }
  } catch (error) {
    console.error("Admin listing-request PUT error:", error);
    return NextResponse.json(
      { error: "Failed to process listing request" },
      { status: 500 }
    );
  }
}
