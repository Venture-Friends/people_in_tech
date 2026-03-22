import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  bio: z.string().max(500).optional(),
  publicTitle: z.string().max(120).optional(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  isProfilePublic: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
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
    const session = await getServerSession(authOptions);
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

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl || null,
        }),
        ...(data.bio !== undefined && { bio: data.bio?.slice(0, 500) || null }),
        ...(data.publicTitle !== undefined && {
          publicTitle: data.publicTitle || null,
        }),
        ...(data.linkedinUrl !== undefined && {
          linkedinUrl: data.linkedinUrl || null,
        }),
        ...(data.website !== undefined && { website: data.website || null }),
        ...(data.isProfilePublic !== undefined && {
          isProfilePublic: data.isProfilePublic,
        }),
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        publicTitle: true,
        linkedinUrl: true,
        website: true,
        isProfilePublic: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
