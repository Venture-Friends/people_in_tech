import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    // Get real stats
    const [totalCompanies, totalCandidates, pendingClaims, activeJobs] =
      await Promise.all([
        prisma.company.count(),
        prisma.user.count({ where: { role: "CANDIDATE" } }),
        prisma.companyClaim.count({ where: { status: "PENDING" } }),
        prisma.jobListing.count({ where: { status: "ACTIVE" } }),
      ]);

    // Top followed companies
    const topCompanies = await prisma.company.findMany({
      orderBy: { followers: { _count: "desc" } },
      take: 5,
      include: {
        _count: { select: { followers: true } },
      },
    });

    // Experience level distribution
    const allProfiles = await prisma.candidateProfile.findMany({
      select: { experienceLevel: true, skills: true },
    });

    const experienceLevels: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    allProfiles.forEach((p) => {
      experienceLevels[p.experienceLevel] =
        (experienceLevels[p.experienceLevel] || 0) + 1;

      const skills = JSON.parse(p.skills) as string[];
      skills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const experienceData = Object.entries(experienceLevels).map(
      ([name, value]) => ({ name, value })
    );

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Generate mock signup trend data (last 30 days)
    const signupTrend = [];
    const followTrend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      signupTrend.push({
        date: dateStr,
        signups: Math.floor(Math.random() * 8) + 2,
      });
      followTrend.push({
        date: dateStr,
        follows: Math.floor(Math.random() * 15) + 3,
      });
    }

    return NextResponse.json({
      kpis: { totalCompanies, totalCandidates, pendingClaims, activeJobs },
      topCompanies: topCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        followers: c._count.followers,
      })),
      experienceData,
      topSkills,
      signupTrend,
      followTrend,
    });
  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
