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
  ShieldCheck,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <ShieldCheck className="size-5 text-[#9fef00]" />
        <span className="font-semibold text-foreground">Admin Panel</span>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          ADMIN
        </Badge>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#9fef00]/10 text-[#9fef00]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
              {item.id === "claims" && pendingClaims > 0 && (
                <Badge className="ml-auto bg-red-500/20 text-red-400 text-[10px]">
                  {pendingClaims}
                </Badge>
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
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <SidebarContent
          activeTab={activeTab}
          pendingClaims={kpis.pendingClaims}
          onTabChange={handleTabChange}
        />
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
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
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#9fef00]" />
            <span className="font-semibold text-foreground">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
