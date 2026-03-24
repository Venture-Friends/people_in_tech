import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes, createHash } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Delete existing tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token
    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${rawToken}`;

    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: user.email,
      subject: "Verify your email — Hiring Partners",
      template: "email-verification",
      data: { name: user.name, verifyUrl },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
