import jwt from "jsonwebtoken";
import type { EmailService, SendEmailOptions } from "./types";
import { ConsoleEmailProvider } from "./providers/console";
import { SmtpEmailProvider } from "./providers/smtp";
import { sendWithRetry, sendBatchThrottled } from "./queue";

export type { TemplateName, SendEmailOptions, EmailService } from "./types";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export function generateUnsubscribeUrl(email: string, type: "newsletter" | "digest" | "events" | "all" = "all"): string {
  const token = jwt.sign({ email, type }, JWT_SECRET, { expiresIn: "30d" });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/api/newsletter/unsubscribe?token=${token}`;
}

function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || "console";

  switch (provider) {
    case "smtp":
      return new SmtpEmailProvider();
    case "console":
      return new ConsoleEmailProvider();
    default:
      console.warn(
        `[email] Unknown EMAIL_PROVIDER "${provider}", falling back to console`
      );
      return new ConsoleEmailProvider();
  }
}

export const emailService: EmailService = createEmailService();

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ id: string; success: boolean }> {
  return sendWithRetry(emailService, options);
}

export async function sendBatchEmail(
  batch: SendEmailOptions[]
): Promise<{ sent: number; failed: number }> {
  return sendBatchThrottled(emailService, batch);
}
