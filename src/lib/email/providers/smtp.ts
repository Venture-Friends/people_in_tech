import type { Transporter } from "nodemailer";
import type { EmailService, SendEmailOptions } from "../types";
import { renderEmail } from "../render";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require("nodemailer") as typeof import("nodemailer");

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export class SmtpEmailProvider implements EmailService {
  async send(
    options: SendEmailOptions
  ): Promise<{ id: string; success: boolean }> {
    const html = await renderEmail(options.template, options.data);
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || "noreply@peopleintech.gr",
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html,
      replyTo: options.replyTo,
    });

    return {
      id: info.messageId ?? crypto.randomUUID(),
      success: true,
    };
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
