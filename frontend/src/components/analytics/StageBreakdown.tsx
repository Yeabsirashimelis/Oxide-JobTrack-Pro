import { StageBreakdownItem } from '@/lib/api'

interface StageBreakdownProps {
  data: StageBreakdownItem[]
}

const stageConfig: Record<string, { name: string; color: string; bgColor: string }> = {
  SAVED: { name: 'Saved', color: 'text-accent', bgColor: 'bg-accent' },
  APPLIED: { name: 'Applied', color: 'text-info', bgColor: 'bg-info' },
  SCREENING: { name: 'Screening', color: 'text-warning', bgColor: 'bg-warning' },
  INTERVIEW: { name: 'Interview', color: 'text-primary', bgColor: 'bg-primary' },
  OFFER: { name: 'Offer', color: 'text-secondary', bgColor: 'bg-secondary' },
  ACCEPTED: { name: 'Accepted', color: 'text-success', bgColor: 'bg-success' },
  REJECTED: { name: 'Rejected', color: 'text-error', bgColor: 'bg-error' },
  WITHDRAWN: { name: 'Withdrawn', color: 'text-text-muted', bgColor: 'bg-accent' },
}

export default function StageBreakdown({ data }: StageBreakdownProps) {
  const total = data.reduce((sum, s) => sum + s.count, 0)

  if (total === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Applications by Stage</h2>
          <p className="text-sm text-text-muted mt-1">0 total applications</p>
        </div>
        <div className="p-5 flex items-center justify-center h-48">
          <p className="text-text-muted">No applications yet</p>
        </div>
      </div>
    )
  }

  // Filter out stages with 0 count for display
  const stagesWithData = data.filter((s) => s.count > 0)

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Applications by Stage</h2>
        <p className="text-sm text-text-muted mt-1">{total} total applications</p>
      </div>
      <div className="p-5">
        {/* Stacked bar */}
        <div className="h-4 flex rounded-full overflow-hidden mb-6">
          {stagesWithData.map((stage) => {
            const config = stageConfig[stage.stage] || { bgColor: 'bg-accent' }
            return (
              <div
                key={stage.stage}
                className={`${config.bgColor} transition-all duration-300`}
                style={{ width: `${(stage.count / total) * 100}%` }}
                title={`${config.name || stage.stage}: ${stage.count}`}
              ></div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {stagesWithData.map((stage) => {
            const config = stageConfig[stage.stage] || { name: stage.stage, color: 'text-text-muted', bgColor: 'bg-accent' }
            return (
              <div key={stage.stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.bgColor}`}></div>
                  <span className="text-sm text-text-muted">{config.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{stage.count}</span>
                  <span className="text-xs text-text-muted">
                    ({stage.percentage}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
