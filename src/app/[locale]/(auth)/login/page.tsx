import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">{t("login")}</h1>
      <LoginForm />
    </div>
  );
}
