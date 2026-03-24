import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // Hash the raw token to match stored hash
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Look up PendingClaim by hashed token
    const pendingClaim = await prisma.pendingClaim.findUnique({
      where: { verifyToken: hashedToken },
      include: { company: true },
    });

    if (!pendingClaim) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (new Date() > pendingClaim.tokenExpiry) {
      return NextResponse.json(
        { error: "This verification link has expired. Please submit a new claim." },
        { status: 410 }
      );
    }

    // Check if already verified
    if (pendingClaim.verified) {
      return NextResponse.json(
        { error: "This claim has already been verified" },
        { status: 409 }
      );
    }

    // Check if user exists with the work email
    let user = await prisma.user.findUnique({
      where: { email: pendingClaim.workEmail },
    });

    const hasAccount = !!user;

    // If no user exists, create one
    if (!user) {
      const randomPassword = randomBytes(16).toString("hex");
      const passwordHash = await hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          name: pendingClaim.fullName,
          email: pendingClaim.workEmail,
          passwordHash,
          role: "CANDIDATE",
          emailVerified: true, // Verified via claim email
        },
      });
    }

    // Create CompanyClaim linked to the user
    const companyClaim = await prisma.companyClaim.create({
      data: {
        companyId: pendingClaim.companyId,
        userId: user.id,
        fullName: pendingClaim.fullName,
        jobTitle: pendingClaim.jobTitle,
        workEmail: pendingClaim.workEmail,
        linkedinUrl: pendingClaim.linkedinUrl,
        message: pendingClaim.message,
        status: "PENDING",
      },
    });

    // Mark PendingClaim as verified and store convertedToId
    await prisma.pendingClaim.update({
      where: { id: pendingClaim.id },
      data: {
        verified: true,
        convertedToId: companyClaim.id,
      },
    });

    // Update company status to CLAIMED if still AUTO_GENERATED
    if (pendingClaim.company.status === "AUTO_GENERATED") {
      await prisma.company.update({
        where: { id: pendingClaim.companyId },
        data: { status: "CLAIMED" },
      });
    }

    // Notify admins
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const adminUrl = `${appUrl}/admin?tab=claims`;

      const { sendEmail } = await import("@/lib/email");

      // Get admin users to notify
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });

      const adminEmails = admins.map((a) => a.email);

      if (adminEmails.length > 0) {
        await sendEmail({
          to: adminEmails,
          subject: `New company claim: ${pendingClaim.company.name} — Hiring Partners`,
          template: "claim-admin-alert",
          data: {
            claimantName: pendingClaim.fullName,
            companyName: pendingClaim.company.name,
            adminUrl,
          },
        });
      }
    } catch (emailError) {
      // Don't fail verification if admin notification fails
      console.error("Failed to send admin notification:", emailError);
    }

    return NextResponse.json({
      success: true,
      hasAccount,
    });
  } catch (error) {
    console.error("Error verifying claim:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
