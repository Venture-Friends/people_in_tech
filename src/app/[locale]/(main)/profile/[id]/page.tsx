import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { ProfilePrivate } from "@/components/profile/profile-private";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileSkills } from "@/components/profile/profile-skills";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { ProfileEducation } from "@/components/profile/profile-education";
import { ProfileCertifications } from "@/components/profile/profile-certifications";
import { ProfileLanguages } from "@/components/profile/profile-languages";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

function parseJsonArray(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore parse errors
  }
  return [];
}

async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      avatarUrl: true,
      bio: true,
      publicTitle: true,
      linkedinUrl: true,
      website: true,
      role: true,
      isProfilePublic: true,
      candidateProfile: {
        select: {
          headline: true,
          skills: true,
          roleInterests: true,
          industries: true,
          preferredLocations: true,
          availability: true,
          preferredWorkType: true,
          portfolioUrl: true,
          githubUrl: true,
          cvUrl: true,
          workExperiences: { orderBy: { order: "asc" } },
          educations: { orderBy: { order: "asc" } },
          certifications: { orderBy: { order: "asc" } },
          spokenLanguages: true,
        },
      },
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Profile | People in Tech",
    description: "Candidate profile on People in Tech",
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getUser(id);

  if (!user || user.role !== "CANDIDATE") {
    notFound();
  }

  // Access control: only ADMIN and COMPANY_REP (with interest) can view
  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/login?returnTo=/profile/${id}`);
  }

  const viewerRole = session.user.role;

  if (viewerRole === "CANDIDATE") {
    // Candidates cannot view other candidates' profiles
    notFound();
  }

  if (viewerRole === "COMPANY_REP") {
    // Company rep can only view if candidate expressed interest in one of their jobs
    const claim = await prisma.companyClaim.findFirst({
      where: {
        userId: session.user.id,
        status: "APPROVED",
      },
      select: { companyId: true },
    });

    if (!claim) {
      notFound();
    }

    const hasInterest = await prisma.jobInterest.findFirst({
      where: {
        userId: id, // the candidate whose profile we're viewing
        job: {
          companyId: claim.companyId,
        },
      },
    });

    if (!hasInterest) {
      notFound();
    }
  }

  // ADMIN can always view — no additional check needed
  const isPublic = user.isProfilePublic;

  const profile = user.candidateProfile;
  const skills = profile ? parseJsonArray(profile.skills) : [];
  const roleInterests = profile ? parseJsonArray(profile.roleInterests) : [];
  const industries = profile ? parseJsonArray(profile.industries) : [];
  const preferredLocations = profile
    ? parseJsonArray(profile.preferredLocations)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Admin badge for private profiles viewed by admin */}
      {!isPublic && viewerRole === "ADMIN" && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          This profile is private. You are viewing it as an admin.
        </div>
      )}

      <ProfileHero
        name={user.name}
        email={viewerRole === "ADMIN" ? user.email : null}
        avatarUrl={user.avatarUrl}
        publicTitle={user.publicTitle}
        headline={profile?.headline ?? null}
        availability={profile?.availability ?? "NOT_SPECIFIED"}
        preferredWorkType={profile?.preferredWorkType ?? "NOT_SPECIFIED"}
        preferredLocations={preferredLocations}
        linkedinUrl={user.linkedinUrl}
        githubUrl={profile?.githubUrl ?? null}
        portfolioUrl={profile?.portfolioUrl ?? null}
        website={user.website}
        cvUrl={profile?.cvUrl ?? null}
      />

      <div className="mt-6 space-y-6">
        {user.bio && <ProfileAbout bio={user.bio} />}

        <ProfileSkills
          skills={skills}
          roleInterests={roleInterests}
          industries={industries}
        />

        {profile && (
          <ProfileExperience
            experiences={profile.workExperiences.map((we) => ({
              id: we.id,
              company: we.company,
              role: we.role,
              startDate: we.startDate.toISOString(),
              endDate: we.endDate?.toISOString() ?? null,
              current: we.current,
              description: we.description,
            }))}
          />
        )}

        {profile && (
          <ProfileEducation
            educations={profile.educations.map((edu) => ({
              id: edu.id,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startYear: edu.startYear,
              endYear: edu.endYear,
            }))}
          />
        )}

        {profile && (
          <ProfileCertifications
            certifications={profile.certifications.map((cert) => ({
              id: cert.id,
              name: cert.name,
              issuer: cert.issuer,
              year: cert.year,
            }))}
          />
        )}

        {profile && (
          <ProfileLanguages
            languages={profile.spokenLanguages.map((lang) => ({
              id: lang.id,
              name: lang.name,
              proficiency: lang.proficiency,
            }))}
          />
        )}
      </div>
    </div>
  );
}
