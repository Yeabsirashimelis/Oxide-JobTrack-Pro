import { AppLayout } from "@/components/layout";
import Link from "next/link";

// Mock data
const application = {
  id: 8,
  title: "Staff Engineer",
  company: "Google",
  companyId: 1,
  location: "Mountain View, CA",
  workMode: "onsite" as const,
  jobType: "Full-time",
  salary: "$250k - $350k",
  source: "LinkedIn",
  appliedDate: "Jan 15, 2026",
  stage: "interview" as const,
  resumeVersion: "resume_v2_senior.pdf",
};

const pipelineHistory = [
  { stage: "Saved", date: "Jan 10, 2026", note: "Found on LinkedIn, looks promising" },
  { stage: "Applied", date: "Jan 15, 2026", note: "Submitted via company portal" },
  { stage: "Screening", date: "Jan 20, 2026", note: "Recruiter call scheduled" },
  { stage: "Interview", date: "Jan 25, 2026", note: "Moving to technical rounds" },
];

const interviews = [
  {
    id: 1,
    round: "Phone Screen",
    interviewer: "Sarah Johnson (Recruiter)",
    date: "Jan 22, 2026",
    time: "10:00 AM",
    mode: "Online",
    outcome: "passed" as const,
    notes: "Great conversation about background and expectations",
  },
  {
    id: 2,
    round: "Technical Interview",
    interviewer: "Mike Chen (Sr. Engineer)",
    date: "Jan 28, 2026",
    time: "2:00 PM",
    mode: "Online",
    outcome: "passed" as const,
    notes: "System design + coding. Discussed distributed systems",
  },
  {
    id: 3,
    round: "Final Round",
    interviewer: "Team Panel",
    date: "Feb 5, 2026",
    time: "10:00 AM",
    mode: "Onsite",
    outcome: "pending" as const,
    notes: "",
  },
];

const notes = [
  { id: 1, content: "Team works on Google Cloud infrastructure", createdAt: "Jan 26, 2026" },
  { id: 2, content: "Mentioned good WLB and hybrid options after onboarding", createdAt: "Jan 22, 2026" },
];

const reminders = [
  { id: 1, title: "Prepare for final round", dueDate: "Feb 4, 2026", status: "pending" as const },
  { id: 2, title: "Send thank you email", dueDate: "Jan 29, 2026", status: "completed" as const },
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

const outcomeConfig: Record<string, { label: string; bg: string; text: string }> = {
  passed: { label: "Passed", bg: "bg-success-light", text: "text-success" },
  failed: { label: "Failed", bg: "bg-error-light", text: "text-error" },
  pending: { label: "Pending", bg: "bg-warning-light", text: "text-warning" },
};

export default function ApplicationDetailPage() {
  const stage = stageConfig[application.stage];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/applications" className="text-text-muted hover:text-foreground">
            Applications
          </Link>
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-foreground">{application.title}</span>
        </nav>

        {/* Application Header */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-accent">
                  {application.company.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{application.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage.bg} ${stage.text}`}>
                    {stage.label}
                  </span>
                </div>
                <Link
                  href={`/companies/${application.companyId}`}
                  className="text-primary hover:text-primary-hover mt-1 inline-block"
                >
                  {application.company}
                </Link>

                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {application.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-muted capitalize">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {application.workMode} • {application.jobType}
                  </span>
                  {application.salary && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {application.salary}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors">
                Edit
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                Update Stage
              </button>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="text-text-muted">Applied:</span>{" "}
              <span className="text-foreground">{application.appliedDate}</span>
            </div>
            <div>
              <span className="text-text-muted">Source:</span>{" "}
              <span className="text-foreground">{application.source}</span>
            </div>
            <div>
              <span className="text-text-muted">Resume:</span>{" "}
              <span className="text-primary">{application.resumeVersion}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Interviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipeline Timeline */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Pipeline Timeline</h2>
              </div>
              <div className="p-5">
                <div className="relative">
                  {pipelineHistory.map((event, index) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        {index < pipelineHistory.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 -mt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{event.stage}</span>
                          <span className="text-sm text-text-muted">{event.date}</span>
                        </div>
                        {event.note && (
                          <p className="text-sm text-text-muted mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interviews */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Interviews ({interviews.length})</h2>
                <button className="text-sm text-primary hover:text-primary-hover">Add Interview</button>
              </div>
              <div className="divide-y divide-border">
                {interviews.map((interview) => {
                  const outcome = outcomeConfig[interview.outcome];
                  return (
                    <div key={interview.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{interview.round}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${outcome.bg} ${outcome.text}`}>
                              {outcome.label}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted mt-1">{interview.interviewer}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-foreground">{interview.date}</p>
                          <p className="text-text-muted">{interview.time} • {interview.mode}</p>
                        </div>
                      </div>
                      {interview.notes && (
                        <p className="text-sm text-text-muted mt-3 p-3 bg-accent-light rounded-lg">
                          {interview.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Notes & Reminders */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Notes</h2>
                <button className="text-sm text-primary hover:text-primary-hover">Add Note</button>
              </div>
              <div className="p-4 space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-accent-light rounded-lg">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-text-muted mt-2">{note.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Reminders</h2>
                <button className="text-sm text-primary hover:text-primary-hover">Add Reminder</button>
              </div>
              <div className="p-4 space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      reminder.status === "completed" ? "bg-success-light" : "bg-warning-light"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={reminder.status === "completed"}
                      readOnly
                      className="w-4 h-4 rounded border-border"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${reminder.status === "completed" ? "line-through text-text-muted" : "text-foreground"}`}>
                        {reminder.title}
                      </p>
                      <p className="text-xs text-text-muted">{reminder.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
