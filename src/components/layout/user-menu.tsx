"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Building2, LayoutDashboard, LogOut, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ActiveContext } from "@/lib/context";

interface CompanyInfo {
  name: string;
  logo: string | null;
  slug: string;
}

export function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const router = useRouter();

  const [activeContext, setActiveContext] = useState<ActiveContext>("personal");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const userRole = session?.user?.role || "CANDIDATE";
  const isCompanyRep = userRole === "COMPANY_REP";

  // Fetch company info and read cookie on mount for COMPANY_REP users
  useEffect(() => {
    if (!isCompanyRep) return;

    // Read cookie from document.cookie
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("pit-active-context="))
      ?.split("=")[1];

    // Default to "company" for company reps if no cookie is set
    setActiveContext((cookieValue as ActiveContext) || "company");

    // Fetch company info
    fetch("/api/dashboard/company/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && !data.error) {
          setCompanyInfo({
            name: data.name,
            logo: data.logo,
            slug: data.slug,
          });
        }
      })
      .catch(() => {
        // Silently fail - user may not have an approved claim
      });
  }, [isCompanyRep]);

  const switchContext = useCallback(
    async (context: ActiveContext) => {
      if (context === activeContext) return;

      try {
        await fetch("/api/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context }),
        });
        setActiveContext(context);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to switch context:", error);
      }
    },
    [activeContext, router]
  );

  if (!session?.user) return null;

  const userName = session.user.name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const showCompanyAvatar = isCompanyRep && activeContext === "company" && companyInfo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar size="default">
          {showCompanyAvatar && companyInfo.logo ? (
            <AvatarImage src={companyInfo.logo} alt={companyInfo.name} />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {showCompanyAvatar ? (
              <Building2 className="size-4" />
            ) : (
              initials
            )}
          </AvatarFallback>
        </Avatar>
        {userRole === "ADMIN" && (
          <span className="bg-primary/[0.1] text-primary text-[10px] rounded-full px-1.5 font-semibold">
            ADMIN
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 border-white/[0.06] bg-card/95 backdrop-blur-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1 py-2">
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <Badge variant="secondary" className="w-fit text-[10px]">
              {userRole}
            </Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Context Switcher for COMPANY_REP users */}
        {isCompanyRep && companyInfo && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground py-1">
                Switch Context
              </DropdownMenuLabel>

              {/* Personal identity */}
              <DropdownMenuItem
                onClick={() => switchContext("personal")}
                className={`flex items-center gap-3 py-2.5 cursor-pointer ${
                  activeContext === "personal"
                    ? "border-l-2 border-primary pl-[calc(0.5rem-2px)]"
                    : ""
                }`}
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{userName}</span>
                  <span className="text-[11px] text-muted-foreground">Personal Profile</span>
                </div>
                {activeContext === "personal" && (
                  <span className="text-[9px] font-semibold text-primary tracking-wider">
                    ACTIVE
                  </span>
                )}
              </DropdownMenuItem>

              {/* Company identity */}
              <DropdownMenuItem
                onClick={() => switchContext("company")}
                className={`flex items-center gap-3 py-2.5 cursor-pointer ${
                  activeContext === "company"
                    ? "border-l-2 border-primary pl-[calc(0.5rem-2px)]"
                    : ""
                }`}
              >
                <Avatar size="sm">
                  {companyInfo.logo ? (
                    <AvatarImage src={companyInfo.logo} alt={companyInfo.name} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                    <Building2 className="size-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{companyInfo.name}</span>
                  <span className="text-[11px] text-muted-foreground">Company Dashboard</span>
                </div>
                {activeContext === "company" && (
                  <span className="text-[9px] font-semibold text-primary tracking-wider">
                    ACTIVE
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <User className="size-4" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="size-4" />
          {t("dashboard")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            document.cookie = "pit-active-context=; path=/; max-age=0";
            document.cookie = "next-auth.session-token=; path=/; max-age=0";
            document.cookie = "__Secure-next-auth.session-token=; path=/; max-age=0";
            await signOut({ callbackUrl: "/en/login" });
          }}
          variant="destructive"
        >
          <LogOut className="size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
