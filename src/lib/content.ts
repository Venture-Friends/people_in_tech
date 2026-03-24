import { prisma } from "@/lib/prisma";

export async function getContent(key: string, locale: string, fallback: string): Promise<string> {
  const block = await prisma.contentBlock.findUnique({
    where: { key_locale: { key, locale } }
  });
  return block?.value ?? fallback;
}

export async function getContentBatch(keys: string[], locale: string): Promise<Record<string, string | null>> {
  const blocks = await prisma.contentBlock.findMany({
    where: { key: { in: keys }, locale }
  });
  const map: Record<string, string | null> = {};
  for (const key of keys) {
    map[key] = blocks.find(b => b.key === key)?.value ?? null;
  }
  return map;
}
