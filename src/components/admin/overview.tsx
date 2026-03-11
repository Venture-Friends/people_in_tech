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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Candidates",
      value: kpis.totalCandidates,
      icon: Users,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Pending Claims",
      value: kpis.pendingClaims,
      icon: ClipboardCheck,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Active Jobs",
      value: kpis.activeJobs,
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Pending claims alert */}
      {kpis.pendingClaims > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="size-5 text-amber-400 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-amber-300">
              {kpis.pendingClaims} pending claim
              {kpis.pendingClaims > 1 ? "s" : ""} require review.
            </span>
            <span className="text-amber-300/70 ml-1">
              Company representatives are waiting for approval.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
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
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${kpi.bgColor}`}
                >
                  <Icon className={`size-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts + Leaderboard row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Signup trends chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Signup Trends</CardTitle>
            <CardDescription>New candidate signups over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
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
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#9fef00"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      fontSize: "12px",
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
          </CardContent>
        </Card>

        {/* Top followed companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-amber-400" />
              Top Companies
            </CardTitle>
            <CardDescription>By follower count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCompanies.length === 0 && (
                <p className="text-sm text-muted-foreground">
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
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {company.name}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {company.followers}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
