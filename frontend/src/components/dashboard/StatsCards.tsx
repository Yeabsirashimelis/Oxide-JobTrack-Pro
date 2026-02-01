"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export default function StatsCards() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(token!),
    enabled: !!token,
  });

  const stats = data?.stats;

  const statCards: StatCard[] = [
    {
      title: "Total Applications",
      value: stats?.totalApplications ?? 0,
      change: stats ? `+${stats.applicationsThisWeek} this week` : undefined,
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "In Progress",
      value: stats?.inProgress ?? 0,
      change: "Active applications",
      changeType: "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Interviews",
      value: stats?.totalInterviews ?? 0,
      change: stats ? `${stats.upcomingInterviews} scheduled` : undefined,
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Offers",
      value: stats?.offers ?? 0,
      change: stats ? `${stats.successRate}% success rate` : undefined,
      changeType: "positive",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-lg border border-border p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-24 bg-accent-light rounded mb-2"></div>
                <div className="h-8 w-16 bg-accent-light rounded"></div>
              </div>
              <div className="p-2 bg-accent-light rounded-lg w-10 h-10"></div>
            </div>
            <div className="h-4 w-20 bg-accent-light rounded mt-3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="bg-surface rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted">{stat.title}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
            </div>
            <div className="p-2 bg-primary-light rounded-lg text-primary">
              {stat.icon}
            </div>
          </div>
          {stat.change && (
            <p
              className={`text-sm mt-3 ${
                stat.changeType === "positive"
                  ? "text-success"
                  : stat.changeType === "negative"
                  ? "text-error"
                  : "text-text-muted"
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
