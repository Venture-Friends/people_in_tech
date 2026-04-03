import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("screenshot") as File | null;
    const metaStr = formData.get("meta") as string | null;

    if (!screenshot || !metaStr) {
      return NextResponse.json(
        { success: false, error: "Missing screenshot or meta" },
        { status: 400 }
      );
    }

    const meta = JSON.parse(metaStr);
    const buffer = Buffer.from(await screenshot.arrayBuffer());

    const feedback = await prisma.feedback.create({
      data: {
        pageUrl: meta.pageUrl ?? "",
        comment: meta.comment || null,
        pins: JSON.stringify(meta.pins ?? []),
        drawings: JSON.stringify(meta.drawings ?? []),
        screenshot: buffer,
        viewport: JSON.stringify(meta.viewport ?? {}),
        scrollPosition: JSON.stringify(meta.scrollPosition ?? {}),
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error("Feedback save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const items = await prisma.feedback.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        pageUrl: true,
        comment: true,
        pins: true,
        drawings: true,
        viewport: true,
        scrollPosition: true,
        createdAt: true,
      },
    });

    const parsed = items.map((item) => ({
      ...item,
      pins: JSON.parse(item.pins),
      drawings: JSON.parse(item.drawings),
      viewport: JSON.parse(item.viewport),
      scrollPosition: JSON.parse(item.scrollPosition),
      screenshotUrl: `/api/feedback/${item.id}/screenshot`,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Feedback list error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
