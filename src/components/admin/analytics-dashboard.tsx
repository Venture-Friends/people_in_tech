"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  kpis: {
    totalCompanies: number;
    totalCandidates: number;
    pendingClaims: number;
    activeJobs: number;
  };
  topCompanies: { id: string; name: string; followers: number }[];
  experienceData: { name: string; value: number }[];
  topSkills: { name: string; count: number }[];
  signupTrend: { date: string; signups: number }[];
  followTrend: { date: string; follows: number }[];
}

const PIE_COLORS = ["#9fef00", "#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const experienceLevelLabels: Record<string, string> = {
  STUDENT: "Student",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
};

const tooltipStyle = {
  background: "rgba(10,12,18,0.9)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  color: "#f8fafc",
  fontSize: "12px",
};

const axisTickStyle = { fontSize: 11, fill: "rgba(255,255,255,0.3)" };

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const experienceDataLabeled = useMemo(() => {
    if (!data) return [];
    return data.experienceData.map((d) => ({
      ...d,
      name: experienceLevelLabels[d.name] || d.name,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Analytics
          </h2>
          <p className="text-sm text-white/[0.35] mt-1">
            Platform-wide analytics and insights
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-white/[0.35] mt-1">
          Platform-wide analytics and insights
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Companies", value: data.kpis.totalCompanies },
          { label: "Candidates", value: data.kpis.totalCandidates },
          { label: "Pending Claims", value: data.kpis.pendingClaims },
          { label: "Active Jobs", value: data.kpis.activeJobs },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5"
          >
            <p className="font-display text-2xl font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-white/30 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Over Time */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                Candidate Signups
              </h3>
              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-white/30"><span>Coming Soon</span></div>
            </div>
            <p className="text-xs text-white/30 mt-0.5">New signups over the last 30 days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.signupTrend}>
                <defs>
                  <linearGradient
                    id="analyticsSignupGrad"
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
                      stopOpacity={0}
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
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="signups"
                  stroke="#9fef00"
                  strokeWidth={2}
                  fill="url(#analyticsSignupGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Follows Over Time */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                Company Follows
              </h3>
              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-white/30"><span>Coming Soon</span></div>
            </div>
            <p className="text-xs text-white/30 mt-0.5">
              New follows over the last 30 days
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.followTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={axisTickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="follows"
                  stroke="#9fef00"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience Level Distribution */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Experience Level Distribution
            </h3>
            <p className="text-xs text-white/30 mt-0.5">
              Breakdown of candidate experience levels
            </p>
          </div>
          <div className="h-64">
            {experienceDataLabeled.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-white/30">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={experienceDataLabeled}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {experienceDataLabeled.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Skills */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Top Skills
            </h3>
            <p className="text-xs text-white/30 mt-0.5">
              Most popular skills among candidates
            </p>
          </div>
          <div className="h-64">
            {data.topSkills.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-white/30">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topSkills}
                  layout="vertical"
                  margin={{ left: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={axisTickStyle}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={axisTickStyle}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#9fef00" radius={[0, 4, 4, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Companies by Followers */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Top Companies by Followers
            </h3>
            <p className="text-xs text-white/30 mt-0.5">
              Most followed companies on the platform
            </p>
          </div>
          {data.topCompanies.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">
              No data available
            </p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCompanies}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={axisTickStyle}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={axisTickStyle}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="followers"
                    fill="#9fef00"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
