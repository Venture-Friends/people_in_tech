import { prisma } from "@/lib/prisma";
import type { EmailService, SendEmailOptions } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function logEmail(
  options: SendEmailOptions,
  status: "SENT" | "FAILED",
  providerId?: string,
  error?: string
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        template: options.template,
        status,
        providerId: providerId ?? null,
        error: error ?? null,
      },
    });
  } catch (logError) {
    console.error("[email-queue] Failed to log email to database:", logError);
  }
}

export async function sendWithRetry(
  service: EmailService,
  options: SendEmailOptions,
  maxAttempts: number = 3
): Promise<{ id: string; success: boolean }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await service.send(options);
      await logEmail(options, "SENT", result.id);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.warn(
          `[email-queue] Attempt ${attempt}/${maxAttempts} failed for "${options.subject}" to ${options.to}. Retrying in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  await logEmail(options, "FAILED", undefined, lastError?.message);
  throw lastError;
}

export async function sendBatchThrottled(
  service: EmailService,
  batch: SendEmailOptions[],
  chunkSize: number = 50
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < batch.length; i += chunkSize) {
    const chunk = batch.slice(i, i + chunkSize);

    const results = await Promise.allSettled(
      chunk.map(async (options) => {
        const result = await service.send(options);
        await logEmail(options, "SENT", result.id);
        return result;
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        await logEmail(chunk[j], "FAILED", undefined, errorMessage);
      }
    }

    const hasMoreChunks = i + chunkSize < batch.length;
    if (hasMoreChunks) {
      await sleep(1000);
    }
  }

  return { sent, failed };
}
