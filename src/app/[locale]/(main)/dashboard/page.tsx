import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as any).role;

  if (role === "ADMIN") {
    redirect(`/${locale}/admin`);
  }

  if (role === "COMPANY_REP") {
    redirect(`/${locale}/dashboard/company`);
  }

  // Default: CANDIDATE
  redirect(`/${locale}/dashboard/candidate`);
}
