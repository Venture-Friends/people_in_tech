import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/company-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth-session";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  return map[mimeType] || ".jpg";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "COMPANY_REP") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await getCompanyForUser(session.user.id);
    if (!company) {
      return NextResponse.json(
        { error: "No approved company claim found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const field = formData.get("field") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!field || !["logo", "cover"].includes(field)) {
      return NextResponse.json(
        { error: "Invalid field. Must be 'logo' or 'cover'." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: PNG, JPG, SVG, WebP`,
        },
        { status: 400 }
      );
    }

    const maxSize = field === "logo" ? MAX_LOGO_SIZE : MAX_COVER_SIZE;
    const maxLabel = field === "logo" ? "2MB" : "5MB";

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${field} is ${maxLabel}.` },
        { status: 400 }
      );
    }

    const ext = getExtension(file.type);
    const timestamp = Date.now();
    const filename = `${company.id}-${field}-${timestamp}${ext}`;
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "companies"
    );

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/companies/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Company upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
