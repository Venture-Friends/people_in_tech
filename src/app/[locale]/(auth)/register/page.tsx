import { RegisterForm } from "@/components/auth/register-form";
import { getTranslations } from "next-intl/server";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">{t("register")}</h1>
      <RegisterForm />
    </div>
  );
}
