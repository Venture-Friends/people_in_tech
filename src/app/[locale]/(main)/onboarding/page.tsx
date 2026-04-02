import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (candidateProfile?.onboardingComplete) {
    redirect(`/${locale}/discover`);
  }

  return <OnboardingWizard />;
}
