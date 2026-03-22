import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "CANDIDATE" },
    });

    // Send welcome + verification emails
    try {
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
      await Promise.all([
        sendEmail({
          to: email,
          subject: "Welcome to Hiring Partners!",
          template: "welcome",
          data: { name },
        }),
        sendEmail({
          to: email,
          subject: "Verify your email — Hiring Partners",
          template: "email-verification",
          data: { name, verifyUrl },
        }),
      ]);
    } catch (emailError) {
      // Don't fail registration if email fails
      console.error("Failed to send registration emails:", emailError);
    }

    return NextResponse.json(
      { message: "Account created", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
