"use client";

import { Suspense, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  Briefcase,
  Calendar,
  TrendingUp,
  Menu,
  BadgeCheck,
} from "lucide-react";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "profile", label: "Company Profile", icon: Building2 },
  { id: "jobs", label: "Job Listings", icon: Briefcase },
  { id: "events", label: "Events", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
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
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors",
              isActive && "text-primary bg-primary/[0.05]"
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

function CompanyDashboardLayoutInner({
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
              <Button variant="outline" size="icon" className="lg:hidden border-white/[0.08] bg-transparent" />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-white/[0.04] bg-black/90 backdrop-blur-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display text-sm font-semibold">
                <Building2 className="size-4 text-primary" />
                Company Dashboard
                <BadgeCheck className="size-3.5 text-primary" />
              </SheetTitle>
            </SheetHeader>
            <Separator className="my-2 bg-white/[0.06]" />
            <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="font-display text-[42px] font-bold tracking-[-0.03em] text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-white/[0.35]">
            Manage your company profile, job listings, events, and more.
          </p>
        </div>
      </div>

      <div className="flex gap-0">
        {/* Desktop sidebar */}
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <div className="sticky top-24 bg-white/[0.02] border-r border-white/[0.04] p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Building2 className="size-4 text-primary" />
              <span className="font-display text-sm font-semibold text-white truncate">
                Dashboard
              </span>
              <BadgeCheck className="size-3.5 shrink-0 text-primary" />
            </div>
            <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function LayoutFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6 lg:mb-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="flex gap-0">
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <div className="bg-white/[0.02] border-r border-white/[0.04] p-4 rounded-2xl">
            <Skeleton className="h-8 w-full rounded-lg mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 lg:p-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </main>
      </div>
    </div>
  );
}

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutFallback />}>
      <CompanyDashboardLayoutInner>{children}</CompanyDashboardLayoutInner>
    </Suspense>
  );
}
