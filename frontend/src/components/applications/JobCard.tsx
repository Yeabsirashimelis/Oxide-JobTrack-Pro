import Link from "next/link";

export interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: "remote" | "hybrid" | "onsite";
  salary?: string;
  appliedDate: string;
  hasInterview?: boolean;
  hasReminder?: boolean;
}

interface JobCardProps {
  job: Job;
}

const workModeLabels = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/applications/${job.id}`}>
      <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        {/* Company */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-accent">
              {job.company.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-text-muted truncate">{job.company}</span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {job.title}
        </h3>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-accent-light text-accent">
            {workModeLabels[job.workMode]}
          </span>
        </div>

        {/* Salary if available */}
        {job.salary && (
          <p className="text-sm font-medium text-success mb-3">{job.salary}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-text-muted">{job.appliedDate}</span>
          <div className="flex items-center gap-2">
            {job.hasInterview && (
              <span className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center" title="Has interview">
                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            )}
            {job.hasReminder && (
              <span className="w-5 h-5 rounded-full bg-warning-light flex items-center justify-center" title="Has reminder">
                <svg className="w-3 h-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
