import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing unsubscribe token" },
        { status: 400 }
      );
    }

    let payload: { email: string; type?: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { email: string; type?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 400 }
      );
    }

    const { email, type } = payload;

    // Unsubscribe from newsletter_subscribers table
    await prisma.newsletterSubscriber.deleteMany({
      where: { email },
    });

    // Also update user preferences if they have an account
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        const updates: Record<string, boolean> = {};
        if (!type || type === "newsletter") updates.emailNewsletter = false;
        if (type === "digest") updates.emailDigest = false;
        if (type === "events") updates.emailEvents = false;
        if (type === "all") {
          updates.emailNewsletter = false;
          updates.emailDigest = false;
          updates.emailEvents = false;
        }

        await prisma.candidateProfile.update({
          where: { userId: user.id },
          data: updates,
        });
      }
    }

    // Send confirmation email
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      subject: "You've been unsubscribed — People in Tech",
      template: "unsubscribe-confirm",
      data: { email },
    });

    // Redirect to a simple confirmation page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}?unsubscribed=true`);
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
