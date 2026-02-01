import JobCard, { Job } from "./JobCard";

export type PipelineStage = "saved" | "applied" | "screening" | "interview" | "offer" | "accepted" | "rejected";

interface KanbanColumnProps {
  stage: PipelineStage;
  jobs: Job[];
}

const stageConfig: Record<PipelineStage, { label: string; color: string; bgColor: string }> = {
  saved: {
    label: "Saved",
    color: "text-accent",
    bgColor: "bg-accent",
  },
  applied: {
    label: "Applied",
    color: "text-info",
    bgColor: "bg-info",
  },
  screening: {
    label: "Screening",
    color: "text-warning",
    bgColor: "bg-warning",
  },
  interview: {
    label: "Interview",
    color: "text-primary",
    bgColor: "bg-primary",
  },
  offer: {
    label: "Offer",
    color: "text-secondary",
    bgColor: "bg-secondary",
  },
  accepted: {
    label: "Accepted",
    color: "text-success",
    bgColor: "bg-success",
  },
  rejected: {
    label: "Rejected",
    color: "text-error",
    bgColor: "bg-error",
  },
};

export default function KanbanColumn({ stage, jobs }: KanbanColumnProps) {
  const config = stageConfig[stage];

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${config.bgColor}`}></span>
        <h3 className={`font-medium ${config.color}`}>{config.label}</h3>
        <span className="text-xs text-text-muted bg-accent-light px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-accent-light/50 rounded-lg p-2 min-h-[500px]">
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {jobs.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-text-muted">No applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
