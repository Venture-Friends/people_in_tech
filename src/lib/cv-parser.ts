/**
 * CV Parser — heuristic-based text extraction from PDF/DOCX
 *
 * Extracts structured data (name, headline, email, phone, links,
 * skills, experience, education, certifications, languages) from
 * raw text produced by pdf-parse or mammoth.
 */

import mammoth from "mammoth";

// ── Types ────────────────────────────────────────────────────────

export interface ParsedCV {
  name: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  links: string[];
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  languages: string[];
}

export interface ExperienceEntry {
  title: string;
  company: string | null;
  period: string | null;
}

export interface EducationEntry {
  degree: string;
  institution: string | null;
  year: string | null;
}

// ── Text extraction ──────────────────────────────────────────────

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/x-pdf"
  ) {
    // Dynamic import: pdf-parse@1.1.1 crashes on static import
    // because it tries to load a test fixture file at module init.
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

// ── Section detection ────────────────────────────────────────────

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience:
    /\b(experience|work\s*history|employment|professional\s*experience|work\s*experience)\b/i,
  education:
    /\b(education|academic|qualifications|degrees?|university|college)\b/i,
  skills:
    /\b(skills|technologies|tech\s*stack|competencies|tools|expertise|proficiencies)\b/i,
  certifications:
    /\b(certifications?|certificates?|accreditations?|licenses?)\b/i,
  languages: /\b(languages?|language\s*skills?)\b/i,
  summary:
    /\b(summary|objective|profile|about\s*me|professional\s*summary|personal\s*statement)\b/i,
};

interface Section {
  name: string;
  startIndex: number;
  endIndex: number;
  content: string;
}

function detectSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: { name: string; lineStart: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    // Section headers are typically short lines (< 60 chars)
    if (trimmed.length === 0 || trimmed.length > 60) continue;

    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmed)) {
        sections.push({ name, lineStart: i });
        break;
      }
    }
  }

  // Build section content ranges
  const result: Section[] = [];
  for (let i = 0; i < sections.length; i++) {
    const start = sections[i].lineStart + 1;
    const end =
      i + 1 < sections.length ? sections[i + 1].lineStart : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    result.push({
      name: sections[i].name,
      startIndex: start,
      endIndex: end,
      content,
    });
  }

  return result;
}

// ── Extraction helpers ───────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const URL_RE =
  /https?:\/\/[^\s,)<>]+/g;

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_RE);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_RE);
  return match ? match[0].trim() : null;
}

function extractLinks(text: string): string[] {
  const matches = text.match(URL_RE) || [];
  // Deduplicate
  return [...new Set(matches)];
}

function extractName(text: string): string | null {
  // Take first non-empty line that looks like a name (2-4 words, no special chars)
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like emails, phones, or URLs
    if (EMAIL_RE.test(line) || URL_RE.test(line)) continue;
    // Name: 2-5 words, primarily letters
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 5 &&
      words.every((w) => /^[A-Za-zÀ-ÖØ-öø-ÿ.'-]+$/.test(w))
    ) {
      return line;
    }
  }
  return null;
}

function extractHeadline(text: string, sections: Section[]): string | null {
  // Check summary section first
  const summary = sections.find((s) => s.name === "summary");
  if (summary) {
    const firstLine = summary.content.split("\n")[0]?.trim();
    if (firstLine && firstLine.length < 120) return firstLine;
  }

  // Otherwise, look at lines 2-5 for a short headline-like string
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(1, 5)) {
    if (EMAIL_RE.test(line) || URL_RE.test(line) || PHONE_RE.test(line))
      continue;
    if (line.length > 10 && line.length < 100) {
      // Looks like a headline (contains typical title words)
      if (
        /\b(engineer|developer|designer|manager|analyst|consultant|architect|lead|director|intern|student|specialist|coordinator)\b/i.test(
          line,
        )
      ) {
        return line;
      }
    }
  }
  return null;
}

function extractSkills(sections: Section[]): string[] {
  const skillSection = sections.find((s) => s.name === "skills");
  if (!skillSection) return [];

  const text = skillSection.content;
  // Try comma-separated, bullet-separated, or newline-separated
  let skills: string[] = [];

  if (text.includes(",")) {
    skills = text
      .split(/[,\n]/)
      .map((s) => s.replace(/^[\s•\-–—*·]+/, "").trim())
      .filter((s) => s.length > 0 && s.length < 50);
  } else {
    skills = text
      .split(/\n/)
      .map((s) => s.replace(/^[\s•\-–—*·]+/, "").trim())
      .filter((s) => s.length > 0 && s.length < 50);
  }

  return [...new Set(skills)].slice(0, 30);
}

function extractExperience(sections: Section[]): ExperienceEntry[] {
  const expSection = sections.find((s) => s.name === "experience");
  if (!expSection) return [];

  const entries: ExperienceEntry[] = [];
  const lines = expSection.content.split("\n").filter((l) => l.trim());

  // Heuristic: look for patterns like "Title at Company" or "Title | Company"
  const TITLE_RE =
    /^(.+?)(?:\s+at\s+|\s*[|–—-]\s*)(.+?)(?:\s*[|–—-]\s*(.+))?$/i;
  const PERIOD_RE =
    /\b(\d{4}\s*[-–—]\s*(?:\d{4}|present|current|now))\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^[\s•\-–—*·]+/, "").trim();
    const titleMatch = line.match(TITLE_RE);
    if (titleMatch) {
      const periodMatch = line.match(PERIOD_RE);
      entries.push({
        title: titleMatch[1].trim(),
        company: titleMatch[2].trim(),
        period: periodMatch ? periodMatch[1].trim() : null,
      });
    } else if (
      line.length < 80 &&
      !line.startsWith("•") &&
      /[A-Z]/.test(line[0] || "")
    ) {
      // Possibly a title-only line; check next line for company
      const periodMatch = line.match(PERIOD_RE);
      const nextLine = lines[i + 1]?.replace(/^[\s•\-–—*·]+/, "").trim();
      if (
        nextLine &&
        nextLine.length < 80 &&
        !PERIOD_RE.test(line) &&
        entries.length < 10
      ) {
        entries.push({
          title: line,
          company: nextLine,
          period: periodMatch ? periodMatch[1].trim() : null,
        });
        i++; // skip consumed line
      }
    }
  }

  return entries.slice(0, 10);
}

function extractEducation(sections: Section[]): EducationEntry[] {
  const eduSection = sections.find((s) => s.name === "education");
  if (!eduSection) return [];

  const entries: EducationEntry[] = [];
  const lines = eduSection.content.split("\n").filter((l) => l.trim());

  const YEAR_RE = /\b(19|20)\d{2}\b/;

  for (let i = 0; i < lines.length && entries.length < 5; i++) {
    const line = lines[i].replace(/^[\s•\-–—*·]+/, "").trim();
    if (line.length < 5) continue;

    const yearMatch = line.match(YEAR_RE);
    const nextLine = lines[i + 1]?.replace(/^[\s•\-–—*·]+/, "").trim();

    // Check if this line contains degree keywords
    if (
      /\b(bachelor|master|mba|phd|bsc|msc|diploma|degree|associate|certificate)\b/i.test(
        line,
      )
    ) {
      entries.push({
        degree: line,
        institution: nextLine && nextLine.length < 80 ? nextLine : null,
        year: yearMatch ? yearMatch[0] : null,
      });
      if (nextLine) i++;
    } else if (line.length < 80 && /[A-Z]/.test(line[0] || "")) {
      // Generic education line
      entries.push({
        degree: line,
        institution: null,
        year: yearMatch ? yearMatch[0] : null,
      });
    }
  }

  return entries;
}

function extractCertifications(sections: Section[]): string[] {
  const certSection = sections.find((s) => s.name === "certifications");
  if (!certSection) return [];

  return certSection.content
    .split("\n")
    .map((l) => l.replace(/^[\s•\-–—*·]+/, "").trim())
    .filter((l) => l.length > 3 && l.length < 120)
    .slice(0, 10);
}

function extractLanguages(sections: Section[]): string[] {
  const langSection = sections.find((s) => s.name === "languages");
  if (!langSection) return [];

  return langSection.content
    .split(/[,\n]/)
    .map((l) => l.replace(/^[\s•\-–—*·]+/, "").trim())
    .filter((l) => l.length > 1 && l.length < 40)
    .slice(0, 10);
}

// ── Main parser ──────────────────────────────────────────────────

export function parseCV(text: string): ParsedCV {
  const sections = detectSections(text);

  return {
    name: extractName(text),
    headline: extractHeadline(text, sections),
    email: extractEmail(text),
    phone: extractPhone(text),
    links: extractLinks(text),
    skills: extractSkills(sections),
    experience: extractExperience(sections),
    education: extractEducation(sections),
    certifications: extractCertifications(sections),
    languages: extractLanguages(sections),
  };
}

// ── High-level: buffer → ParsedCV ────────────────────────────────

export async function parseFileToCV(
  buffer: Buffer,
  mimeType: string,
): Promise<ParsedCV> {
  const text = await extractTextFromFile(buffer, mimeType);
  return parseCV(text);
}
