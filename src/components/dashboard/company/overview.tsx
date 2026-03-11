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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card>
        <CardHeader>
          <CardTitle>Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={followerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1b2e",
                    border: "1px solid #2d3a4d",
                    borderRadius: "8px",
                    color: "#f8fafc",
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
