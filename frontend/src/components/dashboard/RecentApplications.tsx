"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, PipelineStage } from "@/lib/api";

const stageConfig: Record<PipelineStage, { label: string; bg: string; text: string }> = {
  SAVED: {
    label: "Saved",
    bg: "bg-accent-light",
    text: "text-accent",
  },
  APPLIED: {
    label: "Applied",
    bg: "bg-info-light",
    text: "text-info",
  },
  SCREENING: {
    label: "Screening",
    bg: "bg-warning-light",
    text: "text-warning",
  },
  INTERVIEW: {
    label: "Interview",
    bg: "bg-primary-light",
    text: "text-primary",
  },
  OFFER: {
    label: "Offer",
    bg: "bg-secondary-light",
    text: "text-secondary",
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-success-light",
    text: "text-success",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-error-light",
    text: "text-error",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    bg: "bg-accent-light",
    text: "text-text-muted",
  },
};

export default function RecentApplications() {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["recent-applications"],
    queryFn: () => dashboardApi.getRecentApplications(token!, 5),
    enabled: !!token,
  });

  const applications = data?.applications || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not applied";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Applications</h2>
        </div>
        <div className="p-5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 bg-accent-light rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-accent-light rounded mb-2"></div>
                <div className="h-3 w-24 bg-accent-light rounded"></div>
              </div>
              <div className="h-6 w-16 bg-accent-light rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Recent Applications</h2>
        <Link href="/applications" className="text-sm text-primary hover:text-primary-hover">
          View all
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-text-muted">No applications yet</p>
          <Link
            href="/applications"
            className="text-sm text-primary hover:text-primary-hover mt-2 inline-block"
          >
            Add your first application
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Position
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => {
                const stage = stageConfig[app.stage];
                const companyName = app.company?.name || "Unknown";
                return (
                  <tr key={app.id} className="hover:bg-accent-light transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{app.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-accent">
                            {companyName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-text-muted">{companyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.bg} ${stage.text}`}
                      >
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-text-muted">
                        {formatDate(app.appliedAt || app.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-primary hover:text-primary-hover text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
