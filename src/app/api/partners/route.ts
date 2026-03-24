import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true,
      },
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error("Partners GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}
