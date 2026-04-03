import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("cv");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: PDF, DOCX` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const ext = file.type === "application/pdf" ? "pdf" : "docx";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const cvUrl = await uploadFile(buffer, `cvs/${filename}`, file.type);

    // Persist the URL on CandidateProfile
    await prisma.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: { cvUrl },
      create: { userId: session.user.id, cvUrl },
    });

    return NextResponse.json({ cvUrl });
  } catch (error) {
    console.error("Upload CV error:", error);
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 }
    );
  }
}
