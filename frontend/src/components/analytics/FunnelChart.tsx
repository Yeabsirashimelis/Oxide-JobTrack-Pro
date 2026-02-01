import { FunnelStage } from '@/lib/api'

interface FunnelChartProps {
  data: FunnelStage[]
}

const stageColors: Record<string, string> = {
  Applied: 'bg-info',
  Screening: 'bg-warning',
  Interview: 'bg-primary',
  Offer: 'bg-secondary',
  Accepted: 'bg-success',
}

export default function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Application Funnel</h2>
          <p className="text-sm text-text-muted mt-1">Conversion through pipeline stages</p>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-text-muted">No application data available</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Application Funnel</h2>
        <p className="text-sm text-text-muted mt-1">Conversion through pipeline stages</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{stage.count}</span>
                  <span className="text-xs text-text-muted">({Math.round(stage.percentage)}%)</span>
                </div>
              </div>
              <div className="h-8 bg-accent-light rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stageColors[stage.name] || 'bg-primary'} rounded-lg transition-all duration-500`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                ></div>
              </div>
              {index < data.length - 1 && data[index + 1].count > 0 && stage.count > 0 && (
                <div className="flex items-center justify-center py-1">
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xs text-text-muted ml-1">
                    {Math.round((data[index + 1].count / stage.count) * 100)}% conversion
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
