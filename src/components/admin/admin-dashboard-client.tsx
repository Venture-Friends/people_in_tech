"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  Briefcase,
  Calendar,
  Mail,
  BarChart3,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Overview } from "./overview";
import { CompaniesTable } from "./companies-table";
import { CandidatesTable } from "./candidates-table";
import { ClaimsQueue } from "./claims-queue";
import { JobsTable } from "./jobs-table";
import { EventsManager } from "./events-manager";
import { NewsletterComposer } from "./newsletter-composer";
import { AnalyticsDashboard } from "./analytics-dashboard";

interface KPIs {
  totalCompanies: number;
  totalCandidates: number;
  pendingClaims: number;
  activeJobs: number;
}

interface TopCompany {
  id: string;
  name: string;
  followers: number;
}

interface AdminDashboardClientProps {
  kpis: KPIs;
  topCompanies: TopCompany[];
}

const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "claims", label: "Claim Requests", icon: ClipboardCheck },
  { id: "jobs", label: "Job Listings", icon: Briefcase },
  { id: "events", label: "Events", icon: Calendar },
  { id: "newsletters", label: "Newsletters", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function SidebarContent({
  activeTab,
  pendingClaims,
  onTabChange,
}: {
  activeTab: string;
  pendingClaims: number;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="inline-block size-2 rounded-full bg-primary" />
        <span className="font-display text-lg font-bold text-foreground">
          Admin
        </span>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                isActive
                  ? "text-primary bg-primary/[0.05] font-medium"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
              {item.id === "claims" && pendingClaims > 0 && (
                <span className="bg-primary/[0.1] text-primary rounded-full px-2 text-[11px] font-medium ml-auto">
                  {pendingClaims}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminDashboardClient({
  kpis,
  topCompanies,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSheetOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            kpis={kpis}
            topCompanies={topCompanies}
            onNavigate={setActiveTab}
          />
        );
      case "companies":
        return <CompaniesTable />;
      case "candidates":
        return <CandidatesTable />;
      case "claims":
        return <ClaimsQueue />;
      case "jobs":
        return <JobsTable />;
      case "events":
        return <EventsManager />;
      case "newsletters":
        return <NewsletterComposer />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return (
          <Overview
            kpis={kpis}
            topCompanies={topCompanies}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen -m-4 sm:-m-6 lg:-m-8">
      {/* Desktop sidebar */}
      <aside className="w-[220px] shrink-0 hidden lg:flex flex-col bg-white/[0.02] border-r border-white/[0.04]">
        <SidebarContent
          activeTab={activeTab}
          pendingClaims={kpis.pendingClaims}
          onTabChange={handleTabChange}
        />
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 lg:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[220px] p-0 bg-white/[0.02] border-r border-white/[0.04]">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent
                activeTab={activeTab}
                pendingClaims={kpis.pendingClaims}
                onTabChange={handleTabChange}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2.5">
            <span className="inline-block size-2 rounded-full bg-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              Admin
            </span>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-6 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
