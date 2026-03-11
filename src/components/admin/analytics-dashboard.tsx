"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide analytics and insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Signups</CardTitle>
            <CardDescription>New signups over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
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
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#9fef00"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    width={25}
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
                    fill="url(#analyticsSignupGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Follows Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Company Follows</CardTitle>
            <CardDescription>
              New follows over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.followTrend}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    width={25}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="follows"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Experience Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Level Distribution</CardTitle>
            <CardDescription>
              Breakdown of candidate experience levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {experienceDataLabeled.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
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
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>
              Most popular skills among candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.topSkills.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topSkills}
                    layout="vertical"
                    margin={{ left: 60 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#888" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#888" }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#9fef00" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies by Followers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Companies by Followers</CardTitle>
            <CardDescription>
              Most followed companies on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topCompanies}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#888" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#888" }}
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
                    <Bar
                      dataKey="followers"
                      fill="#14b8a6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
