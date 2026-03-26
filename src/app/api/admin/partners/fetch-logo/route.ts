import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

/**
 * Try to fetch an image URL and verify it returns a valid image content-type.
 */
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    return ct.startsWith("image/") || ct.includes("icon");
  } catch {
    // HEAD might not be supported, try GET with small range
    try {
      const res = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
        headers: { Range: "bytes=0-0" },
      });
      if (!res.ok && res.status !== 206) return false;
      const ct = res.headers.get("content-type") || "";
      return ct.startsWith("image/") || ct.includes("icon");
    } catch {
      return false;
    }
  }
}

/**
 * Extract logo candidates from HTML: og:image, apple-touch-icon, shortcut icon, icon links.
 */
function extractLogoUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];

  // og:image
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
  );
  if (ogMatch?.[1]) urls.push(ogMatch[1]);

  // apple-touch-icon
  const appleMatches = html.matchAll(
    /<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/gi
  );
  for (const m of appleMatches) {
    if (m[1]) urls.push(m[1]);
  }

  // icon links (rel="icon" or rel="shortcut icon")
  const iconMatches = html.matchAll(
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/gi
  );
  for (const m of iconMatches) {
    if (m[1]) urls.push(m[1]);
  }

  // Also try href before rel pattern
  const iconMatches2 = html.matchAll(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/gi
  );
  for (const m of iconMatches2) {
    if (m[1]) urls.push(m[1]);
  }

  // Resolve relative URLs
  return urls.map((u) => {
    try {
      return new URL(u, baseUrl).href;
    } catch {
      return u;
    }
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Normalize URL
    let siteUrl = url.trim();
    if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
      siteUrl = `https://${siteUrl}`;
    }

    let baseUrl: string;
    try {
      const parsed = new URL(siteUrl);
      baseUrl = `${parsed.protocol}//${parsed.host}`;
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    // Strategy 1: Try favicon.ico directly
    const faviconUrl = `${baseUrl}/favicon.ico`;
    if (await isValidImageUrl(faviconUrl)) {
      return NextResponse.json({ logoUrl: faviconUrl });
    }

    // Strategy 2: Fetch the HTML and extract logo URLs
    let html = "";
    try {
      const res = await fetch(siteUrl, {
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PeopleInTech/1.0)",
          Accept: "text/html",
        },
      });
      if (res.ok) {
        html = await res.text();
      }
    } catch {
      // HTML fetch failed, continue to fallback
    }

    if (html) {
      const candidates = extractLogoUrls(html, baseUrl);
      for (const candidate of candidates) {
        if (await isValidImageUrl(candidate)) {
          return NextResponse.json({ logoUrl: candidate });
        }
      }
    }

    // Strategy 3: Try common favicon paths
    const commonPaths = [
      "/favicon.png",
      "/favicon.svg",
      "/apple-touch-icon.png",
      "/apple-touch-icon-precomposed.png",
      "/logo.png",
      "/logo.svg",
    ];

    for (const path of commonPaths) {
      const candidateUrl = `${baseUrl}${path}`;
      if (await isValidImageUrl(candidateUrl)) {
        return NextResponse.json({ logoUrl: candidateUrl });
      }
    }

    // Nothing found
    return NextResponse.json(
      { error: "Could not find a logo on this website. Please upload manually." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Fetch logo error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo from website" },
      { status: 500 }
    );
  }
}
