import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cascade deletes handle related data (profile, follows, saved items, etc.)
    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headline: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  experienceLevel: z.enum([
    "STUDENT", "FRESH_GRADUATE", "JUNIOR", "MID", "SENIOR", "LEAD", "STAFF",
    "MANAGER", "DIRECTOR", "EXECUTIVE",
  ]),
  skills: z.array(z.string()),
  roleInterests: z.array(z.string()),
  industries: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  emailDigest: z.boolean(),
  emailEvents: z.boolean(),
  emailNewsletter: z.boolean(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user?.name || "",
      headline: profile.headline || "",
      linkedinUrl: profile.linkedinUrl || "",
      experienceLevel: profile.experienceLevel,
      skills: JSON.parse(profile.skills),
      roleInterests: JSON.parse(profile.roleInterests),
      industries: JSON.parse(profile.industries),
      preferredLocations: JSON.parse(profile.preferredLocations),
      emailDigest: profile.emailDigest,
      emailEvents: profile.emailEvents,
      emailNewsletter: profile.emailNewsletter,
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Update user name
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name },
    });

    // Update candidate profile
    await prisma.candidateProfile.update({
      where: { userId: session.user.id },
      data: {
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
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
