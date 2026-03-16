import { setRequestLocale } from "next-intl/server";
import { ListCompanyForm } from "@/components/company/list-company-form";

export default async function ListCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <ListCompanyForm />
    </div>
  );
}
