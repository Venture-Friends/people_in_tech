import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Only candidates can express interest" }, { status: 403 });
  }

  const { id: jobId } = await params;

  const existing = await prisma.jobInterest.findUnique({
    where: {
      userId_jobId: {
        userId: session.user.id,
        jobId,
      },
    },
  });

  if (existing) {
    await prisma.jobInterest.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ interested: false });
  }

  await prisma.jobInterest.create({
    data: {
      userId: session.user.id,
      jobId,
    },
  });

  return NextResponse.json({ interested: true });
}
