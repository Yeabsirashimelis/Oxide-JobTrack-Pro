import { WeeklyActivity } from '@/lib/api'

interface ActivityChartProps {
  data: WeeklyActivity[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Weekly Activity</h2>
          <p className="text-sm text-text-muted mt-1">Applications and interviews over time</p>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-text-muted">No activity data available</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.applications, d.interviews)), 1)
  const totalApplications = data.reduce((sum, d) => sum + d.applications, 0)
  const totalInterviews = data.reduce((sum, d) => sum + d.interviews, 0)
  const avgPerWeek = data.length > 0 ? Math.round(totalApplications / data.length) : 0

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Weekly Activity</h2>
        <p className="text-sm text-text-muted mt-1">Applications and interviews over time</p>
      </div>
      <div className="p-6">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-text-muted">Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-sm text-text-muted">Interviews</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex items-end gap-4 h-48">
          {data.map((item) => (
            <div key={item.week} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-40">
                {/* Applications bar */}
                <div
                  className="w-5 bg-primary rounded-t transition-all duration-300"
                  style={{ height: `${(item.applications / maxValue) * 100}%`, minHeight: item.applications > 0 ? '4px' : '0' }}
                  title={`${item.applications} applications`}
                ></div>
                {/* Interviews bar */}
                <div
                  className="w-5 bg-secondary rounded-t transition-all duration-300"
                  style={{ height: `${(item.interviews / maxValue) * 100}%`, minHeight: item.interviews > 0 ? '4px' : '0' }}
                  title={`${item.interviews} interviews`}
                ></div>
              </div>
              <span className="text-xs text-text-muted">{item.week}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-text-muted">Total Applications</p>
            <p className="text-xl font-bold text-foreground">{totalApplications}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Interviews</p>
            <p className="text-xl font-bold text-foreground">{totalInterviews}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Avg per Week</p>
            <p className="text-xl font-bold text-foreground">{avgPerWeek}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
