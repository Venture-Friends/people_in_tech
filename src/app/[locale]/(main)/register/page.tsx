import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            People in Tech<span className="text-primary">.</span>
          </h1>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
