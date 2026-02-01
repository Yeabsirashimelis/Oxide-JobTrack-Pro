'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from "@/components/layout"
import { MetricCard, FunnelChart, ActivityChart, StageBreakdown } from "@/components/analytics"
import { useAuth } from '@/context/AuthContext'
import { analyticsApi } from '@/lib/api'

type TimePeriod = 30 | 90 | 365

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(30)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', timePeriod],
    queryFn: () => analyticsApi.get(token!, timePeriod),
    enabled: !!token,
  })

  const analytics = data?.analytics

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
            <button
              onClick={() => setTimePeriod(30)}
              className={`px-3 py-1.5 text-sm rounded-md ${timePeriod === 30 ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent-light'}`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setTimePeriod(90)}
              className={`px-3 py-1.5 text-sm rounded-md ${timePeriod === 90 ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent-light'}`}
            >
              Last 90 days
            </button>
            <button
              onClick={() => setTimePeriod(365)}
              className={`px-3 py-1.5 text-sm rounded-md ${timePeriod === 365 ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent-light'}`}
            >
              All time
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {/* Loading skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-5 animate-pulse">
                  <div className="h-4 w-24 bg-accent-light rounded mb-2"></div>
                  <div className="h-8 w-16 bg-accent-light rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface border border-border rounded-lg h-80 animate-pulse"></div>
              <div className="bg-surface border border-border rounded-lg h-80 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Applications"
                value={analytics?.metrics.totalApplications || 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <MetricCard
                title="Interview Rate"
                value={`${analytics?.metrics.interviewRate || 0}%`}
                subtitle={`${analytics?.metrics.interviewCount || 0} of ${analytics?.metrics.totalApplications || 0} applications`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <MetricCard
                title="Offer Rate"
                value={`${analytics?.metrics.offerRate || 0}%`}
                subtitle={`${analytics?.metrics.offerCount || 0} of ${analytics?.metrics.totalApplications || 0} applications`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
              />
              <MetricCard
                title="Total Interviews"
                value={analytics?.metrics.interviewCount || 0}
                subtitle="Scheduled interviews"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FunnelChart data={analytics?.funnel || []} />
              <ActivityChart data={analytics?.weeklyActivity || []} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <StageBreakdown data={analytics?.stageBreakdown || []} />
              </div>
              <div className="lg:col-span-2">
                {/* Top Sources */}
                <div className="bg-surface border border-border rounded-lg">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Top Sources</h2>
                    <p className="text-sm text-text-muted mt-1">Where your applications come from</p>
                  </div>
                  <div className="p-5">
                    {analytics?.sources && analytics.sources.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.sources.map((item) => (
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
                    ) : (
                      <p className="text-sm text-text-muted text-center py-8">No source data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
