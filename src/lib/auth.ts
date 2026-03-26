import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Auth] Verify email for ${user.email}: ${url}`);
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CANDIDATE",
        input: false,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
  session: {
    modelName: "session",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    modelName: "account",
  },
});

export type Auth = typeof auth;
