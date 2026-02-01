"use client";

import KanbanColumn, { PipelineStage } from "./KanbanColumn";
import { Job } from "./JobCard";

// Mock data - will be replaced with API data
const mockJobs: Record<PipelineStage, Job[]> = {
  saved: [
    {
      id: 1,
      title: "Senior React Developer",
      company: "Netflix",
      location: "Los Angeles, CA",
      workMode: "hybrid",
      salary: "$180k - $220k",
      appliedDate: "Feb 1, 2026",
    },
    {
      id: 2,
      title: "Frontend Architect",
      company: "Stripe",
      location: "San Francisco, CA",
      workMode: "remote",
      salary: "$200k - $250k",
      appliedDate: "Jan 31, 2026",
    },
  ],
  applied: [
    {
      id: 3,
      title: "Full Stack Engineer",
      company: "Vercel",
      location: "Remote",
      workMode: "remote",
      salary: "$150k - $180k",
      appliedDate: "Jan 28, 2026",
      hasReminder: true,
    },
    {
      id: 4,
      title: "Software Engineer II",
      company: "Airbnb",
      location: "San Francisco, CA",
      workMode: "hybrid",
      appliedDate: "Jan 25, 2026",
    },
    {
      id: 5,
      title: "React Native Developer",
      company: "Coinbase",
      location: "Remote",
      workMode: "remote",
      salary: "$140k - $170k",
      appliedDate: "Jan 24, 2026",
    },
  ],
  screening: [
    {
      id: 6,
      title: "Senior Frontend Engineer",
      company: "Shopify",
      location: "Toronto, Canada",
      workMode: "remote",
      salary: "$160k - $190k",
      appliedDate: "Jan 20, 2026",
      hasReminder: true,
    },
    {
      id: 7,
      title: "UI Engineer",
      company: "Figma",
      location: "San Francisco, CA",
      workMode: "hybrid",
      appliedDate: "Jan 18, 2026",
    },
  ],
  interview: [
    {
      id: 8,
      title: "Staff Engineer",
      company: "Google",
      location: "Mountain View, CA",
      workMode: "onsite",
      salary: "$250k - $350k",
      appliedDate: "Jan 15, 2026",
      hasInterview: true,
    },
    {
      id: 9,
      title: "Senior Software Engineer",
      company: "Meta",
      location: "Menlo Park, CA",
      workMode: "hybrid",
      salary: "$200k - $280k",
      appliedDate: "Jan 12, 2026",
      hasInterview: true,
      hasReminder: true,
    },
  ],
  offer: [
    {
      id: 10,
      title: "Lead Frontend Developer",
      company: "Notion",
      location: "San Francisco, CA",
      workMode: "hybrid",
      salary: "$190k - $230k",
      appliedDate: "Jan 5, 2026",
    },
  ],
  accepted: [
    {
      id: 11,
      title: "Principal Engineer",
      company: "Linear",
      location: "Remote",
      workMode: "remote",
      salary: "$220k - $280k",
      appliedDate: "Dec 15, 2025",
    },
  ],
  rejected: [
    {
      id: 12,
      title: "Frontend Developer",
      company: "Twitter",
      location: "San Francisco, CA",
      workMode: "hybrid",
      appliedDate: "Jan 10, 2026",
    },
    {
      id: 13,
      title: "React Developer",
      company: "Uber",
      location: "San Francisco, CA",
      workMode: "onsite",
      appliedDate: "Jan 8, 2026",
    },
  ],
};

const stages: PipelineStage[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
  "rejected",
];

export default function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <KanbanColumn key={stage} stage={stage} jobs={mockJobs[stage]} />
      ))}
    </div>
  );
}
