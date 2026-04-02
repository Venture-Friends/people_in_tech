import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: jobId } = await params;

  const interests = await prisma.jobInterest.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          candidateProfile: {
            select: {
              headline: true,
              experienceLevel: true,
            },
          },
        },
      },
    },
  });

  const candidates = interests.map((i) => ({
    userId: i.user.id,
    name: i.user.name,
    headline: i.user.candidateProfile?.headline || null,
    experienceLevel: i.user.candidateProfile?.experienceLevel || null,
    expressedAt: i.createdAt.toISOString(),
  }));

  return NextResponse.json({ candidates });
}
