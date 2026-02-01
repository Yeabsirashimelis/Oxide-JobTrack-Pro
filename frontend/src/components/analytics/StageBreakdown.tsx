interface StageData {
  name: string;
  count: number;
  color: string;
  bgColor: string;
}

const stageData: StageData[] = [
  { name: "Saved", count: 2, color: "text-accent", bgColor: "bg-accent" },
  { name: "Applied", count: 5, color: "text-info", bgColor: "bg-info" },
  { name: "Screening", count: 3, color: "text-warning", bgColor: "bg-warning" },
  { name: "Interview", count: 4, color: "text-primary", bgColor: "bg-primary" },
  { name: "Offer", count: 2, color: "text-secondary", bgColor: "bg-secondary" },
  { name: "Accepted", count: 2, color: "text-success", bgColor: "bg-success" },
  { name: "Rejected", count: 6, color: "text-error", bgColor: "bg-error" },
];

const total = stageData.reduce((sum, s) => sum + s.count, 0);

export default function StageBreakdown() {
  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Applications by Stage</h2>
        <p className="text-sm text-text-muted mt-1">{total} total applications</p>
      </div>
      <div className="p-5">
        {/* Stacked bar */}
        <div className="h-4 flex rounded-full overflow-hidden mb-6">
          {stageData.map((stage) => (
            <div
              key={stage.name}
              className={`${stage.bgColor} transition-all duration-300`}
              style={{ width: `${(stage.count / total) * 100}%` }}
              title={`${stage.name}: ${stage.count}`}
            ></div>
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {stageData.map((stage) => (
            <div key={stage.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.bgColor}`}></div>
                <span className="text-sm text-text-muted">{stage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{stage.count}</span>
                <span className="text-xs text-text-muted">
                  ({Math.round((stage.count / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
