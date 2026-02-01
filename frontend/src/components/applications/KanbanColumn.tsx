import JobCard from "./JobCard";
import { Application, PipelineStage } from "@/lib/api";

interface KanbanColumnProps {
  stage: PipelineStage;
  applications: Application[];
  onDrop?: (applicationId: string, newStage: PipelineStage) => void;
}

const stageConfig: Record<PipelineStage, { label: string; color: string; bgColor: string }> = {
  SAVED: {
    label: "Saved",
    color: "text-accent",
    bgColor: "bg-accent",
  },
  APPLIED: {
    label: "Applied",
    color: "text-info",
    bgColor: "bg-info",
  },
  SCREENING: {
    label: "Screening",
    color: "text-warning",
    bgColor: "bg-warning",
  },
  INTERVIEW: {
    label: "Interview",
    color: "text-primary",
    bgColor: "bg-primary",
  },
  OFFER: {
    label: "Offer",
    color: "text-secondary",
    bgColor: "bg-secondary",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-success",
    bgColor: "bg-success",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-error",
    bgColor: "bg-error",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "text-text-muted",
    bgColor: "bg-accent",
  },
};

export default function KanbanColumn({ stage, applications, onDrop }: KanbanColumnProps) {
  const config = stageConfig[stage];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-primary/10");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-primary/10");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-primary/10");
    const applicationId = e.dataTransfer.getData("applicationId");
    if (applicationId && onDrop) {
      onDrop(applicationId, stage);
    }
  };

  const handleDragStart = (e: React.DragEvent, applicationId: string) => {
    e.dataTransfer.setData("applicationId", applicationId);
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${config.bgColor}`}></span>
        <h3 className={`font-medium ${config.color}`}>{config.label}</h3>
        <span className="text-xs text-text-muted bg-accent-light px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        className="flex-1 bg-accent-light/50 rounded-lg p-2 min-h-[500px] transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application.id}
              draggable
              onDragStart={(e) => handleDragStart(e, application.id)}
              className="cursor-grab active:cursor-grabbing"
            >
              <JobCard application={application} />
            </div>
          ))}

          {applications.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-text-muted">No applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
