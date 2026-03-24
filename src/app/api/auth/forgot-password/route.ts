import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({ success: true });
    }

    // Rate limit: max 3 requests per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.count({
      where: { userId: user.id, createdAt: { gte: oneHourAgo } },
    });

    if (recentTokens >= 3) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // Dynamic import to avoid circular deps during build
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      subject: "Reset your password — Hiring Partners",
      template: "password-reset",
      data: { name: user.name, resetUrl },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: true });
  }
}
