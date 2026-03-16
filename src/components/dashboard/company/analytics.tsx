"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  profileViews: { date: string; views: number }[];
  followerGrowth: { date: string; followers: number }[];
  jobClicks: { title: string; clicks: number }[];
  followersByLevel: { level: string; count: number }[];
}

const PIE_COLORS = ["#9fef00", "#38bdf8", "#a78bfa", "#fb7185", "#f59e0b"];

const tooltipStyle = {
  backgroundColor: "rgba(10,12,18,0.9)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "8px",
  color: "#f8fafc",
  fontSize: "12px",
};

const axisStroke = "rgba(255,255,255,0.3)";
const gridStroke = "rgba(255,255,255,0.04)";

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/company/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
        <p className="text-white/[0.35]">
          Unable to load analytics data. Please try again later.
        </p>
      </div>
    );
  }

  // Format dates for display
  const formattedViews = data.profileViews.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const formattedGrowth = data.followerGrowth.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Views */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Profile Views</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedViews}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#9fef00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#9fef00" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Follower Growth */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Follower Growth</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient
                    id="followerGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#9fef00" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#9fef00"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#9fef00"
                  strokeWidth={2}
                  fill="url(#followerGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#9fef00" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Listing Clicks */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Job Listing Clicks</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.jobClicks} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridStroke}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="title"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="clicks"
                  fill="#9fef00"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Followers by Experience Level */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
          <h3 className="font-display text-lg font-semibold text-white mb-4">Followers by Experience Level</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.followersByLevel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="level"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.followersByLevel.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
