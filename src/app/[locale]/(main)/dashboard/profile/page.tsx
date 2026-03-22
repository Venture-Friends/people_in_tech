import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { ProfileEditor } from "@/components/dashboard/profile-editor";

export default async function DashboardProfilePage({
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">
        My Profile
      </h1>
      <p className="mt-1 text-sm text-white/40">
        Manage your personal profile and visibility settings
      </p>
      <div className="mt-8">
        <ProfileEditor />
      </div>
    </div>
  );
}
