import { cookies } from "next/headers";

export type ActiveContext = "personal" | "company";

export async function getActiveContext(): Promise<ActiveContext> {
  const cookieStore = await cookies();
  return (cookieStore.get("pit-active-context")?.value as ActiveContext) || "personal";
}
