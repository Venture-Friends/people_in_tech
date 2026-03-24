export type TemplateName =
  | "welcome"
  | "email-verification"
  | "password-reset"
  | "claim-submitted"
  | "claim-approved"
  | "claim-rejected"
  | "claim-admin-alert"
  | "weekly-digest"
  | "event-announcement"
  | "newsletter"
  | "unsubscribe-confirm";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: TemplateName;
  data: Record<string, unknown>;
  replyTo?: string;
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<{ id: string; success: boolean }>;
  sendBatch(
    options: SendEmailOptions[]
  ): Promise<{ sent: number; failed: number }>;
}
