import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      select: { screenshot: true },
    });

    if (!feedback) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(feedback.screenshot, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Screenshot fetch error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
