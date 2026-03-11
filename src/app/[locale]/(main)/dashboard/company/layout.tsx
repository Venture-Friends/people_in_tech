"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Calendar,
  Image,
  BarChart3,
  Menu,
  BadgeCheck,
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Company Profile", icon: Building2 },
  { id: "jobs", label: "Job Listings", icon: Briefcase },
  { id: "events", label: "Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "overview";

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}` as any);
    setMobileOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        {/* Mobile menu button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Company Dashboard
                <BadgeCheck className="size-4 text-primary" />
              </SheetTitle>
            </SheetHeader>
            <Separator className="my-2" />
            <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Company Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your company profile, job listings, events, and more.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-card p-3 ring-1 ring-foreground/10">
              <Building2 className="size-5 text-primary" />
              <span className="text-sm font-medium text-foreground truncate">
                Company Dashboard
              </span>
              <BadgeCheck className="size-4 shrink-0 text-primary" />
            </div>
            <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
