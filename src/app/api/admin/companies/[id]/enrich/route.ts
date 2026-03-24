import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchPage, parseHtml } from "@/lib/enrichment/scraper";
import { extractAll } from "@/lib/enrichment/extractors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!company.website) {
      return NextResponse.json(
        { error: "Company has no website URL" },
        { status: 400 }
      );
    }

    const html = await fetchPage(company.website);
    const $ = parseHtml(html);
    const enrichment = extractAll($, company.website);

    return NextResponse.json({ enrichment });
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: "Failed to enrich company data" },
      { status: 500 }
    );
  }
}
