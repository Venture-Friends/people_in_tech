import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function GET() {
  const session = await getSession();
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
