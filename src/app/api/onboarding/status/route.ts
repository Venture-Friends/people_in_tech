import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ onboardingComplete: false, authenticated: false });
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });
  return NextResponse.json({
    onboardingComplete: profile?.onboardingComplete ?? false,
    authenticated: true,
  });
}
