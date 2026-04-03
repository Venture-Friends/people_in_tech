"use client";

import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { LayoutDashboard, LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("nav");
  const router = useRouter();

  const userRole = session?.user?.role || "CANDIDATE";

  if (!session?.user) return null;

  const userName = session.user.name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar size="default">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
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
            await authClient.signOut();
            router.push("/login");
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
