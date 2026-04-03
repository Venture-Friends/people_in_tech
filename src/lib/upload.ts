import { put, del } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  buffer: Buffer,
  pathname: string,
  contentType: string
): Promise<string> {
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
  });
  return blob.url;
}

/**
 * Delete a file from Vercel Blob storage.
 * Accepts a full blob URL. No-ops if url is falsy or not a blob URL.
 */
export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch {
    // Ignore deletion errors (file may already be gone)
  }
}
