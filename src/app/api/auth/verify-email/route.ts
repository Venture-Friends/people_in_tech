import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
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

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification link has expired" },
        { status: 400 }
      );
    }

    // Mark email as verified and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
