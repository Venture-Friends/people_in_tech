import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claimSchema } from "@/lib/validations/claim";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    // Validate request body
    const parsed = claimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, fullName, jobTitle, workEmail, linkedinUrl, message } =
      parsed.data;

    // Check company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check company is not already verified
    if (company.status === "VERIFIED") {
      return NextResponse.json(
        { error: "This company is already verified" },
        { status: 400 }
      );
    }

    // Check user doesn't have a pending claim for this company
    const existingClaim = await prisma.companyClaim.findFirst({
      where: {
        companyId,
        userId,
        status: "PENDING",
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You already have a pending claim for this company" },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = await prisma.companyClaim.create({
      data: {
        companyId,
        userId,
        fullName,
        jobTitle,
        workEmail,
        linkedinUrl: linkedinUrl || null,
        message: message || null,
        status: "PENDING",
      },
    });

    // Update company status to CLAIMED if still AUTO_GENERATED
    if (company.status === "AUTO_GENERATED") {
      await prisma.company.update({
        where: { id: companyId },
        data: { status: "CLAIMED" },
      });
    }

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
