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

    const claim = await prisma.companyClaim.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "PENDING") {
      return NextResponse.json(
        { error: "Claim has already been reviewed" },
        { status: 400 }
      );
    }

    if (action === "reject" && !reviewNote) {
      return NextResponse.json(
        { error: "Review note is required when rejecting a claim" },
        { status: 400 }
      );
    }

    const session = auth.session!;
    const now = new Date();

    if (action === "approve") {
      // Approve: update claim, set company to VERIFIED, set user role to COMPANY_REP
      await prisma.$transaction([
        prisma.companyClaim.update({
          where: { id },
          data: {
            status: "APPROVED",
            reviewedBy: session.user.id,
            reviewNote: reviewNote || null,
            reviewedAt: now,
          },
        }),
        prisma.company.update({
          where: { id: claim.companyId },
          data: { status: "VERIFIED" },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: "COMPANY_REP" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Claim approved. Company verified and user promoted to COMPANY_REP.",
      });
    } else {
      // Reject: update claim status with reason
      await prisma.companyClaim.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
          reviewNote,
          reviewedAt: now,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Claim rejected.",
      });
    }
  } catch (error) {
    console.error("Admin claim PUT error:", error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
