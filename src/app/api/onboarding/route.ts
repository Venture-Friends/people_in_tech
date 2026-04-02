import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { getSession } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const session = await getSession();

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

  // Update user name, locale, and linkedinUrl
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.fullName,
      locale: data.language,
      linkedinUrl: data.linkedinUrl || null,
    },
  });

  // Upsert candidate profile
  await prisma.candidateProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      headline: data.headline || null,
      cvUrl: data.cvUrl || null,
      experienceLevel: data.experienceLevel,
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
      cvUrl: data.cvUrl || null,
      experienceLevel: data.experienceLevel,
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
