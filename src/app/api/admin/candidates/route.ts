import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const format = searchParams.get("format") || "json";

    const where: Record<string, unknown> = {
      role: "CANDIDATE",
    };
    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      });
    }

    if (experienceLevel) {
      conditions.push({
        candidateProfile: { experienceLevel },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const candidates = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        candidateProfile: true,
      },
    });

    const mapped = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      experienceLevel: c.candidateProfile?.experienceLevel || "N/A",
      skills: c.candidateProfile ? JSON.parse(c.candidateProfile.skills) : [],
      joinedAt: c.createdAt.toISOString(),
    }));

    if (format === "csv") {
      const headers = ["Name", "Email", "Experience Level", "Skills", "Joined"];
      const rows = mapped.map((c) =>
        [
          c.name,
          c.email,
          c.experienceLevel,
          (c.skills as string[]).join("; "),
          new Date(c.joinedAt).toLocaleDateString(),
        ].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="candidates.csv"',
        },
      });
    }

    return NextResponse.json({ candidates: mapped });
  } catch (error) {
    console.error("Admin candidates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
