interface WeekData {
  week: string;
  applications: number;
  interviews: number;
}

const weeklyData: WeekData[] = [
  { week: "Week 1", applications: 5, interviews: 1 },
  { week: "Week 2", applications: 8, interviews: 2 },
  { week: "Week 3", applications: 6, interviews: 3 },
  { week: "Week 4", applications: 3, interviews: 2 },
  { week: "Week 5", applications: 7, interviews: 4 },
  { week: "Week 6", applications: 4, interviews: 2 },
];

const maxApplications = Math.max(...weeklyData.map((d) => d.applications));

export default function ActivityChart() {
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
          {weeklyData.map((data) => (
            <div key={data.week} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-40">
                {/* Applications bar */}
                <div
                  className="w-5 bg-primary rounded-t transition-all duration-300"
                  style={{ height: `${(data.applications / maxApplications) * 100}%` }}
                  title={`${data.applications} applications`}
                ></div>
                {/* Interviews bar */}
                <div
                  className="w-5 bg-secondary rounded-t transition-all duration-300"
                  style={{ height: `${(data.interviews / maxApplications) * 100}%` }}
                  title={`${data.interviews} interviews`}
                ></div>
              </div>
              <span className="text-xs text-text-muted">{data.week}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-text-muted">Total Applications</p>
            <p className="text-xl font-bold text-foreground">
              {weeklyData.reduce((sum, d) => sum + d.applications, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Interviews</p>
            <p className="text-xl font-bold text-foreground">
              {weeklyData.reduce((sum, d) => sum + d.interviews, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Avg per Week</p>
            <p className="text-xl font-bold text-foreground">
              {Math.round(weeklyData.reduce((sum, d) => sum + d.applications, 0) / weeklyData.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
