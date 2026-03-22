import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context } = body;

    if (context !== "personal" && context !== "company") {
      return NextResponse.json(
        { error: "Invalid context. Must be 'personal' or 'company'." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("pit-active-context", context, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error setting context:", error);
    return NextResponse.json(
      { error: "Failed to set context" },
      { status: 500 }
    );
  }
}
