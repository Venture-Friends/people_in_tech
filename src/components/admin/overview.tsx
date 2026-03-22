"use client";

import { useMemo } from "react";
import {
  Building2,
  Users,
  ClipboardCheck,
  Briefcase,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface OverviewProps {
  kpis: KPIs;
  topCompanies: TopCompany[];
  onNavigate: (tab: string) => void;
}

function generateMockSignupData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      signups: Math.floor(Math.random() * 8) + 2,
    });
  }
  return data;
}

export function Overview({ kpis, topCompanies, onNavigate }: OverviewProps) {
  const signupData = useMemo(() => generateMockSignupData(), []);

  const kpiCards = [
    {
      label: "Total Companies",
      value: kpis.totalCompanies,
      icon: Building2,
    },
    {
      label: "Total Candidates",
      value: kpis.totalCandidates,
      icon: Users,
    },
    {
      label: "Pending Claims",
      value: kpis.pendingClaims,
      icon: ClipboardCheck,
    },
    {
      label: "Active Jobs",
      value: kpis.activeJobs,
      icon: Briefcase,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-white/[0.35] text-sm mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Pending claims alert */}
      {kpis.pendingClaims > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/[0.08] bg-primary/[0.03] px-5 py-4">
          <AlertTriangle className="size-5 text-primary shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-primary">
              {kpis.pendingClaims} pending claim
              {kpis.pendingClaims > 1 ? "s" : ""} require review.
            </span>
            <span className="text-white/[0.35] ml-1">
              Company representatives are waiting for approval.
            </span>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-primary text-primary-foreground rounded-lg"
            onClick={() => onNavigate("claims")}
          >
            Review Claims
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-4 text-white/30" />
              </div>
              <p className="font-display text-2xl font-bold text-primary mt-3">
                {kpi.value}
              </p>
              <p className="text-xs text-white/30 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts + Leaderboard row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Signup trends chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
                Signup Trends
              </h2>
              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-white/30"><span>Coming Soon</span></div>
            </div>
            <p className="text-xs text-white/30 mt-0.5">
              New candidate signups over the last 30 days
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupData}>
                <defs>
                  <linearGradient
                    id="signupGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#9fef00"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="#9fef00"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,18,0.9)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="#9fef00"
                  strokeWidth={2}
                  fill="url(#signupGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top followed companies */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="size-4 text-amber-400" />
              Top Companies
            </h2>
            <p className="text-xs text-white/30 mt-0.5">By follower count</p>
          </div>
          <div className="space-y-3">
            {topCompanies.length === 0 && (
              <p className="text-sm text-white/30">
                No companies yet
              </p>
            )}
            {topCompanies.map((company, index) => (
              <div
                key={company.id}
                className="flex items-center gap-3"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-400"
                      : index === 1
                        ? "bg-gray-400/20 text-gray-400"
                        : index === 2
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-white/[0.05] text-white/30"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {company.name}
                  </p>
                </div>
                <span className="text-[13px] text-white/30 tabular-nums">
                  {company.followers}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
