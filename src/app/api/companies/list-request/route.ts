import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
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

    // If user is logged in, create a full CompanyClaim
    if (session?.user) {
      const userId = (session.user as { id: string }).id;
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
    }

    // Send email notifications
    try {
      const { sendEmail } = await import("@/lib/email");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // Notify admins
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New company listing request: ${companyName}`,
          template: "claim-admin-alert",
          data: {
            claimantName: session?.user?.name || contactEmail,
            companyName,
            adminUrl: `${appUrl}/admin`,
          },
        });
      }

      // Confirm to requester
      await sendEmail({
        to: contactEmail,
        subject: "We received your listing request — Hiring Partners",
        template: "claim-submitted",
        data: {
          name: session?.user?.name || contactEmail.split("@")[0],
          companyName,
        },
      });
    } catch (emailError) {
      console.error("Failed to send listing request emails:", emailError);
    }

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    console.error("Error creating company listing request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
