"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { applicationsApi, Application, PipelineStage } from "@/lib/api";
import KanbanColumn from "./KanbanColumn";

const stages: PipelineStage[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

// Valid stage transitions
const validTransitions: Record<PipelineStage, PipelineStage[]> = {
  SAVED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["SCREENING", "INTERVIEW", "REJECTED", "WITHDRAWN"],
  SCREENING: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

interface KanbanBoardProps {
  companyFilter?: string;
  workModeFilter?: string;
}

export default function KanbanBoard({ companyFilter, workModeFilter }: KanbanBoardProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.getAll(token!),
    enabled: !!token,
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
      applicationsApi.update(token!, id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const handleDrop = (applicationId: string, newStage: PipelineStage) => {
    const application = data?.applications.find((a) => a.id === applicationId);
    if (!application) return;

    const currentStage = application.stage as PipelineStage;
    const allowedTransitions = validTransitions[currentStage];

    if (!allowedTransitions.includes(newStage)) {
      alert(`Cannot move from ${currentStage} to ${newStage}`);
      return;
    }

    updateStageMutation.mutate({ id: applicationId, stage: newStage });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage} className="flex flex-col w-72 shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-light animate-pulse"></div>
              <div className="h-5 w-20 bg-accent-light rounded animate-pulse"></div>
            </div>
            <div className="flex-1 bg-accent-light/50 rounded-lg p-2 min-h-[500px]">
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-surface border border-border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-accent-light rounded-lg"></div>
                      <div className="h-4 w-24 bg-accent-light rounded"></div>
                    </div>
                    <div className="h-5 w-full bg-accent-light rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-accent-light rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Failed to load applications. Please try again.</p>
      </div>
    );
  }

  let applications = data?.applications || [];

  // Apply filters
  if (companyFilter) {
    applications = applications.filter((a) => a.companyId === companyFilter);
  }

  if (workModeFilter) {
    applications = applications.filter((a) => a.workMode === workModeFilter);
  }

  // Group applications by stage
  const applicationsByStage = stages.reduce((acc, stage) => {
    acc[stage] = applications.filter((app) => app.stage === stage);
    return acc;
  }, {} as Record<PipelineStage, Application[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          applications={applicationsByStage[stage]}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
