import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || undefined;

    const where: Record<string, unknown> = {};
    if (locale) {
      where.locale = locale;
    }

    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: { key: "asc" },
    });

    const mapped = blocks.map((b) => ({
      id: b.id,
      key: b.key,
      value: b.value,
      locale: b.locale,
      updatedBy: b.updatedBy,
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json({ blocks: mapped });
  } catch (error) {
    console.error("Admin content GET error:", error);
    return NextResponse.json({ error: "Failed to fetch content blocks" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { blocks } = body;

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json({ error: "blocks array is required" }, { status: 400 });
    }

    const results = [];

    for (const block of blocks) {
      const { key, value, locale } = block;

      if (!key || typeof value !== "string" || !locale) {
        continue;
      }

      const upserted = await prisma.contentBlock.upsert({
        where: { key_locale: { key, locale } },
        update: {
          value,
          updatedBy: auth.session!.user.id,
        },
        create: {
          key,
          value,
          locale,
          updatedBy: auth.session!.user.id,
        },
      });

      results.push({
        id: upserted.id,
        key: upserted.key,
        value: upserted.value,
        locale: upserted.locale,
        updatedAt: upserted.updatedAt.toISOString(),
      });
    }

    return NextResponse.json({ blocks: results });
  } catch (error) {
    console.error("Admin content PUT error:", error);
    return NextResponse.json({ error: "Failed to update content blocks" }, { status: 500 });
  }
}
