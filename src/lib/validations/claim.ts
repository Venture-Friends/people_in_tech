import { z } from "zod";

export const claimSchema = z.object({
  companyId: z.string(),
  fullName: z.string().min(2, "Name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  workEmail: z.string().email("Valid email required"),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  message: z.string().optional(),
});

export type ClaimInput = z.infer<typeof claimSchema>;
