import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard", "/admin", "/onboarding"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Strip locale prefix for matching (e.g. /en/dashboard → /dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|el)/, "") || "/";

  // Redirect authenticated users away from login/register
  if (sessionCookie && authRoutes.some((r) => pathWithoutLocale.startsWith(r))) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!sessionCookie && protectedRoutes.some((r) => pathWithoutLocale.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
