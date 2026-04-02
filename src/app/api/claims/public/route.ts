import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { claimSchema } from "@/lib/validations/claim";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = claimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, fullName, jobTitle, workEmail, linkedinUrl, message } =
      parsed.data;

    // Look up company (needed for email template)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      // Always return success to prevent enumeration
      return NextResponse.json({ success: true });
    }

    // Rate limit: max 3 pending claims per email per 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClaims = await prisma.pendingClaim.count({
      where: {
        workEmail,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentClaims >= 3) {
      // Always return success to prevent enumeration
      return NextResponse.json({ success: true });
    }

    // Generate verification token
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create PendingClaim record
    await prisma.pendingClaim.create({
      data: {
        companyId,
        fullName,
        jobTitle,
        workEmail,
        linkedinUrl: linkedinUrl || null,
        message: message || null,
        verifyToken: hashedToken,
        tokenExpiry,
      },
    });

    // Send emails
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verifyUrl = `${appUrl}/verify-claim?token=${rawToken}`;

      const { sendEmail } = await import("@/lib/email");

      // Send confirmation email to claimant
      await sendEmail({
        to: workEmail,
        subject: `Verify your claim for ${company.name} — People in Tech`,
        template: "claim-submitted",
        data: {
          name: fullName,
          companyName: company.name,
          verifyUrl,
        },
      });
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error("Failed to send claim verification email:", emailError);
    }

    // Always return success to prevent enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating public claim:", error);
    // Always return success to prevent enumeration
    return NextResponse.json({ success: true });
  }
}
