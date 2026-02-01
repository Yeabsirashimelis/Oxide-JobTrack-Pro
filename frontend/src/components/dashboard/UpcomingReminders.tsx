"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";

const typeConfig = {
  INTERVIEW: {
    bg: "bg-primary-light",
    text: "text-primary",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  FOLLOW_UP: {
    bg: "bg-warning-light",
    text: "text-warning",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  DEADLINE: {
    bg: "bg-error-light",
    text: "text-error",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  INTERVIEW_PREP: {
    bg: "bg-info-light",
    text: "text-info",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  GENERAL: {
    bg: "bg-accent-light",
    text: "text-accent",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
};

interface UpcomingItem {
  id: string;
  title: string;
  company: string;
  type: keyof typeof typeConfig;
  date: string;
  time?: string;
  link?: string;
}

export default function UpcomingReminders() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["upcoming"],
    queryFn: () => dashboardApi.getUpcoming(token!, 5),
    enabled: !!token,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  // Combine interviews and reminders into a single list
  const items: UpcomingItem[] = [];

  if (data?.interviews) {
    data.interviews.forEach((interview) => {
      items.push({
        id: `interview-${interview.id}`,
        title: interview.roundName,
        company: interview.application?.company?.name || "Unknown",
        type: "INTERVIEW",
        date: formatDate(interview.scheduledAt),
        time: formatTime(interview.scheduledAt),
        link: interview.application ? `/applications/${interview.application.id}` : undefined,
      });
    });
  }

  if (data?.reminders) {
    data.reminders.forEach((reminder) => {
      items.push({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        company: reminder.application?.company?.name || "General",
        type: reminder.type as keyof typeof typeConfig,
        date: formatDate(reminder.dueAt),
        link: reminder.application ? `/applications/${reminder.application.id}` : undefined,
      });
    });
  }

  // Sort by date
  items.sort((a, b) => {
    const dateA = a.date === "Today" ? 0 : a.date === "Tomorrow" ? 1 : 2;
    const dateB = b.date === "Today" ? 0 : b.date === "Tomorrow" ? 1 : 2;
    return dateA - dateB;
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Upcoming</h2>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 bg-accent-light rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-accent-light rounded mb-1"></div>
                <div className="h-3 w-16 bg-accent-light rounded"></div>
              </div>
              <div className="h-4 w-12 bg-accent-light rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Upcoming</h2>
        <Link href="/applications" className="text-sm text-primary hover:text-primary-hover">
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-text-muted">No upcoming events</p>
          <p className="text-xs text-text-muted mt-1">
            Schedule interviews or add reminders
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.slice(0, 5).map((item) => {
            const config = typeConfig[item.type] || typeConfig.GENERAL;
            const content = (
              <div className="px-5 py-3 flex items-center gap-4 hover:bg-accent-light transition-colors">
                <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">{item.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{item.date}</p>
                  {item.time && (
                    <p className="text-xs text-text-muted">{item.time}</p>
                  )}
                </div>
              </div>
            );

            return item.link ? (
              <Link key={item.id} href={item.link}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
