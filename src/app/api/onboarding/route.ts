import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = onboardingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.issues },
      { status: 400 }
    );
  }

  const data = result.data;

  // Update user name and locale if changed
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.fullName,
      locale: data.language,
    },
  });

  // Upsert candidate profile
  await prisma.candidateProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      headline: data.headline || null,
      experienceLevel: data.experienceLevel,
      linkedinUrl: data.linkedinUrl || null,
      skills: JSON.stringify(data.skills),
      roleInterests: JSON.stringify(data.roleInterests),
      industries: JSON.stringify(data.industries),
      preferredLocations: JSON.stringify(data.preferredLocations),
      emailDigest: data.emailDigest,
      emailEvents: data.emailEvents,
      emailNewsletter: data.emailNewsletter,
      onboardingComplete: true,
    },
    update: {
      headline: data.headline || null,
      experienceLevel: data.experienceLevel,
      linkedinUrl: data.linkedinUrl || null,
      skills: JSON.stringify(data.skills),
      roleInterests: JSON.stringify(data.roleInterests),
      industries: JSON.stringify(data.industries),
      preferredLocations: JSON.stringify(data.preferredLocations),
      emailDigest: data.emailDigest,
      emailEvents: data.emailEvents,
      emailNewsletter: data.emailNewsletter,
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ success: true });
}
