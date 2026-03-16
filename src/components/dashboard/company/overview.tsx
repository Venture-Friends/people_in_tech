"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Briefcase, Calendar, Activity } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";

interface OverviewProps {
  followerCount: number;
  activeJobCount: number;
  upcomingEventCount: number;
}

function generateFollowerGrowthData() {
  const data = [];
  const now = new Date();
  let base = 120;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    base += Math.floor(Math.random() * 6) - 1;
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      followers: Math.max(base, 100),
    });
  }
  return data;
}

const recentActivity = [
  {
    id: 1,
    action: "New follower joined",
    detail: "A user started following your company",
    time: "2 hours ago",
  },
  {
    id: 2,
    action: "Job listing viewed",
    detail: "Senior Frontend Engineer received 12 views",
    time: "4 hours ago",
  },
  {
    id: 3,
    action: "Event registration",
    detail: "New registration for Tech Talk: AI in Production",
    time: "6 hours ago",
  },
  {
    id: 4,
    action: "Profile updated",
    detail: "Company description was updated",
    time: "1 day ago",
  },
  {
    id: 5,
    action: "New follower joined",
    detail: "A user started following your company",
    time: "2 days ago",
  },
];

export function OverviewClient({
  followerCount,
  activeJobCount,
  upcomingEventCount,
}: OverviewProps) {
  const followerGrowthData = useMemo(() => generateFollowerGrowthData(), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          icon={Users}
          value={followerCount}
          label="Followers"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          icon={Briefcase}
          value={activeJobCount}
          label="Active Roles"
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          icon={Calendar}
          value={upcomingEventCount}
          label="Upcoming Events"
        />
      </div>

      {/* Follower Growth Chart */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white mb-4">
          Follower Growth
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={followerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,12,18,0.9)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="followers"
                stroke="#9fef00"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#9fef00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-5">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-white mb-4 flex items-center gap-2">
          <Activity className="size-5 text-white/40" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div>
                <p className="text-[13px] font-medium text-white/80">
                  {item.action}
                </p>
                <p className="text-[13px] text-white/[0.35]">{item.detail}</p>
              </div>
              <span className="shrink-0 text-[11px] text-white/30 ml-3">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
