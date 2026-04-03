import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "ADMIN")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;

  const rep = await prisma.companyClaim.findFirst({
    where: { companyId: id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      jobTitle: true,
      workEmail: true,
      linkedinUrl: true,
    },
  });

  return NextResponse.json({ representative: rep });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const { fullName, jobTitle, workEmail, linkedinUrl } = body;

  if (!fullName || !jobTitle || !workEmail)
    return NextResponse.json(
      { error: "Name, job title, and work email are required" },
      { status: 400 }
    );

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company)
    return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const adminId = (auth.session!.user as { id: string }).id;

  const claim = await prisma.companyClaim.create({
    data: {
      companyId: id,
      userId: adminId,
      fullName,
      jobTitle,
      workEmail,
      linkedinUrl: linkedinUrl || null,
      status: "APPROVED",
      reviewedBy: adminId,
      reviewNote: "Added by admin",
      reviewedAt: new Date(),
    },
  });

  if (company.status !== "VERIFIED")
    await prisma.company.update({ where: { id }, data: { status: "VERIFIED" } });

  return NextResponse.json({ success: true, claim });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;

  await prisma.companyClaim.deleteMany({
    where: { companyId: id, status: "APPROVED" },
  });

  const remaining = await prisma.companyClaim.count({
    where: { companyId: id },
  });

  if (remaining === 0)
    await prisma.company.update({
      where: { id },
      data: { status: "AUTO_GENERATED" },
    });

  return NextResponse.json({ success: true });
}
