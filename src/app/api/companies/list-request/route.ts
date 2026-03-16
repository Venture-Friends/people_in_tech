import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { companyName, website, contactEmail, contactPhone, yourRole, message } = body;

    if (!companyName || !contactEmail || !yourRole) {
      return NextResponse.json(
        { error: "Company name, contact email, and your role are required" },
        { status: 400 }
      );
    }

    // Create a placeholder company with PENDING status
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug,
        website: website || null,
        industry: "Other",
        status: "PENDING",
      },
    });

    // Attach a claim to the placeholder company
    await prisma.companyClaim.create({
      data: {
        companyId: company.id,
        userId,
        fullName: session.user.name || "",
        jobTitle: yourRole,
        workEmail: contactEmail,
        message: [
          contactPhone ? `Phone: ${contactPhone}` : null,
          message || null,
        ]
          .filter(Boolean)
          .join("\n") || null,
      },
    });

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    console.error("Error creating company listing request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
