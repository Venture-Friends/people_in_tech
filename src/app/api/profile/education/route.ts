import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";
import { educationSchema } from "@/lib/validations/profile";

async function getCandidateProfileId(userId: string) {
  const cp = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return cp?.id ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = educationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    let cpId = await getCandidateProfileId(session.user.id);
    if (!cpId) {
      const cp = await prisma.candidateProfile.create({
        data: { userId: session.user.id },
      });
      cpId = cp.id;
    }

    const { id: _id, ...data } = result.data;
    const entry = await prisma.education.create({
      data: {
        candidateProfileId: cpId,
        institution: data.institution,
        degree: data.degree || null,
        field: data.field || null,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
        order: data.order,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Create education error:", error);
    return NextResponse.json(
      { error: "Failed to create education" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = educationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    if (!result.data.id) {
      return NextResponse.json(
        { error: "ID is required for update" },
        { status: 400 }
      );
    }

    const cpId = await getCandidateProfileId(session.user.id);
    if (!cpId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = await prisma.education.findFirst({
      where: { id: result.data.id, candidateProfileId: cpId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { id, ...data } = result.data;
    const entry = await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        degree: data.degree || null,
        field: data.field || null,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
        order: data.order,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Update education error:", error);
    return NextResponse.json(
      { error: "Failed to update education" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const cpId = await getCandidateProfileId(session.user.id);
    if (!cpId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = await prisma.education.findFirst({
      where: { id, candidateProfileId: cpId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.education.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete education error:", error);
    return NextResponse.json(
      { error: "Failed to delete education" },
      { status: 500 }
    );
  }
}
