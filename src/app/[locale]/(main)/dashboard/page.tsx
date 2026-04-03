import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as any).role;

  if (role === "ADMIN") {
    redirect(`/${locale}/admin`);
  }

  if (role === "COMPANY_REP") {
    // Company reps use the candidate dashboard — admin handles company editing
    redirect(`/${locale}/dashboard/candidate`);
  }

  // Default: CANDIDATE
  redirect(`/${locale}/dashboard/candidate`);
}
