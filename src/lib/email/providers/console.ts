import type { EmailService, SendEmailOptions } from "../types";

export class ConsoleEmailProvider implements EmailService {
  async send(
    options: SendEmailOptions
  ): Promise<{ id: string; success: boolean }> {
    const id = crypto.randomUUID();
    const recipients = Array.isArray(options.to)
      ? options.to.join(", ")
      : options.to;

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (console)
To:       ${recipients}
Subject:  ${options.subject}
Template: ${options.template}
Data:     ${JSON.stringify(options.data, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return { id, success: true };
  }

  async sendBatch(
    batch: SendEmailOptions[]
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const options of batch) {
      try {
        await this.send(options);
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }
}
