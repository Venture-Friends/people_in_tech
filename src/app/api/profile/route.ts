import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";
import { profileUpdateSchema } from "@/lib/validations/profile";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        publicTitle: true,
        linkedinUrl: true,
        website: true,
        isProfilePublic: true,
        candidateProfile: {
          select: {
            id: true,
            headline: true,
            experienceLevel: true,
            skills: true,
            roleInterests: true,
            industries: true,
            preferredLocations: true,
            portfolioUrl: true,
            githubUrl: true,
            cvUrl: true,
            availability: true,
            preferredWorkType: true,
            salaryExpectation: true,
            allowContactEmail: true,
            workExperiences: { orderBy: { order: "asc" } },
            educations: { orderBy: { order: "asc" } },
            certifications: { orderBy: { order: "asc" } },
            spokenLanguages: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse JSON-string arrays into real arrays
    const cp = user.candidateProfile;
    const profile = cp
      ? {
          ...cp,
          skills: safeJsonParse(cp.skills),
          roleInterests: safeJsonParse(cp.roleInterests),
          industries: safeJsonParse(cp.industries),
          preferredLocations: safeJsonParse(cp.preferredLocations),
        }
      : null;

    return NextResponse.json({
      user: { ...user, candidateProfile: profile },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // ── Split into User vs CandidateProfile updates ────────────────────
    const userUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.avatarUrl !== undefined)
      userUpdate.avatarUrl = data.avatarUrl || null;
    if (data.bio !== undefined) userUpdate.bio = data.bio?.slice(0, 500) || null;
    if (data.publicTitle !== undefined)
      userUpdate.publicTitle = data.publicTitle || null;
    if (data.linkedinUrl !== undefined)
      userUpdate.linkedinUrl = data.linkedinUrl || null;
    if (data.website !== undefined) userUpdate.website = data.website || null;
    if (data.isProfilePublic !== undefined)
      userUpdate.isProfilePublic = data.isProfilePublic;

    const cpUpdate: Record<string, unknown> = {};
    if (data.headline !== undefined) cpUpdate.headline = data.headline || null;
    if (data.experienceLevel !== undefined)
      cpUpdate.experienceLevel = data.experienceLevel;
    if (data.skills !== undefined)
      cpUpdate.skills = JSON.stringify(data.skills);
    if (data.roleInterests !== undefined)
      cpUpdate.roleInterests = JSON.stringify(data.roleInterests);
    if (data.industries !== undefined)
      cpUpdate.industries = JSON.stringify(data.industries);
    if (data.preferredLocations !== undefined)
      cpUpdate.preferredLocations = JSON.stringify(data.preferredLocations);
    if (data.portfolioUrl !== undefined)
      cpUpdate.portfolioUrl = data.portfolioUrl || null;
    if (data.githubUrl !== undefined)
      cpUpdate.githubUrl = data.githubUrl || null;
    if (data.availability !== undefined)
      cpUpdate.availability = data.availability;
    if (data.preferredWorkType !== undefined)
      cpUpdate.preferredWorkType = data.preferredWorkType;
    if (data.salaryExpectation !== undefined)
      cpUpdate.salaryExpectation = data.salaryExpectation || null;
    if (data.allowContactEmail !== undefined)
      cpUpdate.allowContactEmail = data.allowContactEmail;

    // Update User
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdate,
      });
    }

    // Update CandidateProfile (upsert to handle edge cases)
    if (Object.keys(cpUpdate).length > 0) {
      await prisma.candidateProfile.upsert({
        where: { userId: session.user.id },
        update: cpUpdate,
        create: { userId: session.user.id, ...cpUpdate },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

function safeJsonParse(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
