import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth-session";

export default async function CompanyDashboardPage({
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

  // Company editing is admin-only — redirect reps to candidate dashboard
  redirect(`/${locale}/dashboard/candidate`);
}
