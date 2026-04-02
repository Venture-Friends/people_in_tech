import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            People in Tech<span className="text-primary">.</span>
          </h1>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
