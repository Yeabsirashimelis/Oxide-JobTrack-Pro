import { AppLayout } from "@/components/layout";
import Link from "next/link";

// Mock data - will be replaced with API data
const company = {
  id: 1,
  name: "Google",
  industry: "Technology",
  size: "10,000+ employees",
  location: "Mountain View, CA",
  website: "https://google.com",
  description: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and AI.",
};

const applications = [
  {
    id: 1,
    title: "Staff Engineer",
    stage: "interview",
    appliedDate: "Jan 15, 2026",
    workMode: "onsite",
  },
  {
    id: 2,
    title: "Senior Software Engineer",
    stage: "rejected",
    appliedDate: "Dec 10, 2025",
    workMode: "hybrid",
  },
  {
    id: 3,
    title: "Frontend Developer",
    stage: "rejected",
    appliedDate: "Nov 5, 2025",
    workMode: "remote",
  },
];

const notes = [
  {
    id: 1,
    content: "Had a great initial call with the recruiter. They mentioned the team is growing rapidly.",
    createdAt: "Jan 16, 2026",
  },
  {
    id: 2,
    content: "Company culture seems very engineering-focused. Good work-life balance reviews on Glassdoor.",
    createdAt: "Jan 10, 2026",
  },
];

const stageConfig: Record<string, { label: string; bg: string; text: string }> = {
  saved: { label: "Saved", bg: "bg-accent-light", text: "text-accent" },
  applied: { label: "Applied", bg: "bg-info-light", text: "text-info" },
  screening: { label: "Screening", bg: "bg-warning-light", text: "text-warning" },
  interview: { label: "Interview", bg: "bg-primary-light", text: "text-primary" },
  offer: { label: "Offer", bg: "bg-secondary/10", text: "text-secondary" },
  accepted: { label: "Accepted", bg: "bg-success-light", text: "text-success" },
  rejected: { label: "Rejected", bg: "bg-error-light", text: "text-error" },
};

export default function CompanyDetailPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/companies" className="text-text-muted hover:text-foreground">
            Companies
          </Link>
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-foreground">{company.name}</span>
        </nav>

        {/* Company Header */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-accent">
                {company.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                  <p className="text-text-muted mt-1">{company.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                    Add Application
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {company.size}
                </div>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {company.website}
                </a>
              </div>

              {company.description && (
                <p className="mt-4 text-sm text-text-muted">{company.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Applications ({applications.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {applications.map((app) => {
                  const stage = stageConfig[app.stage];
                  return (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-accent-light transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">{app.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-muted">{app.appliedDate}</span>
                          <span className="text-xs text-text-muted capitalize">{app.workMode}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage.bg} ${stage.text}`}>
                        {stage.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Notes</h2>
                <button className="text-sm text-primary hover:text-primary-hover">Add Note</button>
              </div>
              <div className="p-4 space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-accent-light rounded-lg">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-text-muted mt-2">{note.createdAt}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
