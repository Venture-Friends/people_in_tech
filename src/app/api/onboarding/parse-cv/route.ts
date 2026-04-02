import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth-session";
import { parseFileToCV } from "@/lib/cv-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseFileToCV(buffer, file.type);

    // Save file to disk
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${session.user.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const cvUrl = `/uploads/cvs/${fileName}`;

    return NextResponse.json({ success: true, data: parsed, cvUrl });
  } catch (error) {
    console.error("[parse-cv] Error:", error);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 },
    );
  }
}
