import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().min(2),
  headline: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  experienceLevel: z.enum(["STUDENT", "GRADUATE", "JUNIOR"]),
  roleInterests: z.array(z.string()).min(1, "Select at least one"),
  skills: z.array(z.string()),
  industries: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  emailDigest: z.boolean(),
  emailEvents: z.boolean(),
  emailNewsletter: z.boolean(),
  language: z.enum(["en", "el"]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
