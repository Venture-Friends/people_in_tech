import { z } from "zod";

// ── Scalar profile fields ──────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  // User table
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z
    .string()
    .url()
    .or(z.literal(""))
    .optional(),
  bio: z.string().max(500).optional().nullable(),
  publicTitle: z.string().max(120).optional().nullable(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  isProfilePublic: z.boolean().optional(),

  // CandidateProfile table
  headline: z.string().max(200).optional().nullable(),
  experienceLevel: z
    .enum(["STUDENT", "JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER", "DIRECTOR"])
    .optional(),
  skills: z.array(z.string()).optional(),
  roleInterests: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().or(z.literal("")).optional().nullable(),
  githubUrl: z.string().url().or(z.literal("")).optional().nullable(),
  availability: z
    .enum(["NOT_SPECIFIED", "OPEN_TO_WORK", "NOT_LOOKING", "OPEN_TO_FREELANCE"])
    .optional(),
  preferredWorkType: z
    .enum(["NOT_SPECIFIED", "REMOTE", "HYBRID", "ONSITE"])
    .optional(),
  salaryExpectation: z.string().max(100).or(z.literal("")).optional().nullable(),
  allowContactEmail: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ── Work Experience ────────────────────────────────────────────────────
export const workExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1).max(150),
  role: z.string().min(1).max(150),
  startDate: z.string().min(1), // ISO string
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
});

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;

// ── Education ──────────────────────────────────────────────────────────
export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1).max(200),
  degree: z.string().max(200).optional(),
  field: z.string().max(200).optional(),
  startYear: z.number().int().min(1950).max(2040),
  endYear: z.number().int().min(1950).max(2040).optional(),
  order: z.number().int().min(0).default(0),
});

export type EducationInput = z.infer<typeof educationSchema>;

// ── Certification ──────────────────────────────────────────────────────
export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).optional(),
  year: z.number().int().min(1950).max(2040).optional(),
  order: z.number().int().min(0).default(0),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ── Spoken Language ────────────────────────────────────────────────────
export const spokenLanguageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  proficiency: z
    .enum(["NATIVE", "FLUENT", "CONVERSATIONAL", "BASIC"])
    .default("CONVERSATIONAL"),
});

export type SpokenLanguageInput = z.infer<typeof spokenLanguageSchema>;
