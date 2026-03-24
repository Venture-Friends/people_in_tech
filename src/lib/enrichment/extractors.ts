import type { CheerioAPI } from "cheerio";
import type { EnrichmentResult } from "./types";

export function extractDescription($: CheerioAPI): string | null {
  // Try og:description first, then meta description, then first meaningful paragraph
  const ogDesc = $('meta[property="og:description"]').attr("content");
  if (ogDesc) return ogDesc.trim();

  const metaDesc = $('meta[name="description"]').attr("content");
  if (metaDesc) return metaDesc.trim();

  // Try common about sections
  const aboutText = $('[class*="about"], [id*="about"], [data-section*="about"]')
    .first()
    .find("p")
    .first()
    .text()
    .trim();
  if (aboutText && aboutText.length > 30) return aboutText;

  return null;
}

export function extractLogo($: CheerioAPI, baseUrl: string): string | null {
  // Try og:image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) return resolveUrl(ogImage, baseUrl);

  // Try common logo selectors
  const logoSelectors = [
    'img[class*="logo"]',
    'img[alt*="logo" i]',
    'img[src*="logo"]',
    'link[rel="icon"][type="image/png"]',
    'link[rel="apple-touch-icon"]',
  ];

  for (const selector of logoSelectors) {
    const src = $(selector).first().attr("href") || $(selector).first().attr("src");
    if (src) return resolveUrl(src, baseUrl);
  }

  return null;
}

export function extractLinkedIn($: CheerioAPI): string | null {
  const linkedinLink = $('a[href*="linkedin.com/company"]').first().attr("href");
  return linkedinLink || null;
}

export function extractTechnologies($: CheerioAPI): string[] {
  const techs = new Set<string>();

  // Check for common tech references in meta tags and body text
  const bodyText = $("body").text().toLowerCase();
  const knownTechs = [
    "React", "Angular", "Vue", "Next.js", "Node.js", "Python", "Java",
    "TypeScript", "JavaScript", "Go", "Rust", "Ruby", "PHP", "C#", ".NET",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "PostgreSQL", "MongoDB",
    "Redis", "GraphQL", "REST", "Terraform", "Django", "Spring",
    "Flutter", "React Native", "Swift", "Kotlin",
  ];

  for (const tech of knownTechs) {
    if (bodyText.includes(tech.toLowerCase())) {
      techs.add(tech);
    }
  }

  return Array.from(techs);
}

export function extractAll($: CheerioAPI, url: string): EnrichmentResult {
  return {
    description: extractDescription($),
    logo: extractLogo($, url),
    linkedinUrl: extractLinkedIn($),
    locations: [],
    technologies: extractTechnologies($),
    founded: null,
    size: null,
  };
}

function resolveUrl(path: string, base: string): string {
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}
