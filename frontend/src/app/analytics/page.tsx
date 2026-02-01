import { AppLayout } from "@/components/layout";
import { MetricCard, FunnelChart, ActivityChart, StageBreakdown } from "@/components/analytics";

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-text-muted mt-1">
            Track your job search performance and insights
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">Time period:</span>
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
            <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-white">
              Last 30 days
            </button>
            <button className="px-3 py-1.5 text-sm rounded-md text-text-muted hover:bg-accent-light">
              Last 90 days
            </button>
            <button className="px-3 py-1.5 text-sm rounded-md text-text-muted hover:bg-accent-light">
              All time
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Applications"
            value={24}
            trend={{ value: "12% vs last month", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <MetricCard
            title="Interview Rate"
            value="33%"
            subtitle="8 of 24 applications"
            trend={{ value: "5% vs last month", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <MetricCard
            title="Offer Rate"
            value="8.3%"
            subtitle="2 of 24 applications"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
          <MetricCard
            title="Avg Response Time"
            value="5 days"
            subtitle="From applied to first response"
            trend={{ value: "2 days faster", isPositive: true }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <ActivityChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StageBreakdown />
          </div>
          <div className="lg:col-span-2">
            {/* Top Sources */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Top Sources</h2>
                <p className="text-sm text-text-muted mt-1">Where your applications come from</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {[
                    { source: "LinkedIn", count: 12, percentage: 50, interviews: 5 },
                    { source: "Company Website", count: 6, percentage: 25, interviews: 2 },
                    { source: "Referral", count: 4, percentage: 17, interviews: 3 },
                    { source: "Indeed", count: 2, percentage: 8, interviews: 0 },
                  ].map((item) => (
                    <div key={item.source} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-foreground">{item.source}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-accent-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium text-foreground">{item.count}</span>
                        <span className="text-xs text-text-muted ml-1">apps</span>
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-sm text-success">{item.interviews} interviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
