import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompanyForUser } from "@/lib/company-helpers";

function generateMockData() {
  const now = new Date();

  // Profile views over time (last 30 days)
  const profileViews = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 80) + 20,
    };
  });

  // Follower growth (last 30 days)
  let followerBase = 150;
  const followerGrowth = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    followerBase += Math.floor(Math.random() * 8) - 1;
    return {
      date: date.toISOString().split("T")[0],
      followers: followerBase,
    };
  });

  // Job listing clicks (per listing, mock data)
  const jobClicks = [
    { title: "Senior Frontend Engineer", clicks: 245 },
    { title: "Backend Developer", clicks: 189 },
    { title: "Product Designer", clicks: 156 },
    { title: "DevOps Engineer", clicks: 98 },
    { title: "Data Analyst", clicks: 72 },
  ];

  // Followers by experience level
  const followersByLevel = [
    { level: "Student", count: 45 },
    { level: "Junior", count: 62 },
    { level: "Mid-Level", count: 85 },
    { level: "Senior", count: 53 },
    { level: "Lead/Manager", count: 28 },
  ];

  return {
    profileViews,
    followerGrowth,
    jobClicks,
    followersByLevel,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY_REP") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await getCompanyForUser(session.user.id);
    if (!company) {
      return NextResponse.json(
        { error: "No approved company claim found" },
        { status: 404 }
      );
    }

    const data = generateMockData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
