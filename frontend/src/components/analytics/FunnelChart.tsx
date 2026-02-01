interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const funnelData: FunnelStage[] = [
  { name: "Applied", count: 24, percentage: 100, color: "bg-info" },
  { name: "Screening", count: 12, percentage: 50, color: "bg-warning" },
  { name: "Interview", count: 8, percentage: 33, color: "bg-primary" },
  { name: "Offer", count: 3, percentage: 12.5, color: "bg-secondary" },
  { name: "Accepted", count: 2, percentage: 8.3, color: "bg-success" },
];

export default function FunnelChart() {
  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Application Funnel</h2>
        <p className="text-sm text-text-muted mt-1">Conversion through pipeline stages</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{stage.count}</span>
                  <span className="text-xs text-text-muted">({stage.percentage}%)</span>
                </div>
              </div>
              <div className="h-8 bg-accent-light rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-lg transition-all duration-500`}
                  style={{ width: `${stage.percentage}%` }}
                ></div>
              </div>
              {index < funnelData.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xs text-text-muted ml-1">
                    {Math.round((funnelData[index + 1].count / stage.count) * 100)}% conversion
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
