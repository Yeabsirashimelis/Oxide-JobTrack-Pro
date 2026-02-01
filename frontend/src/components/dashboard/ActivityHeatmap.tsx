'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { dashboardApi, DailyActivity } from '@/lib/api'

export default function ActivityHeatmap() {
  const { token } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['activity-heatmap'],
    queryFn: () => dashboardApi.getActivityHeatmap(token!),
    enabled: !!token,
  })

  const activityData = data?.activity || []
  const maxActivity = data?.summary?.maxDailyActivity || 0

  // Create a map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>()
    activityData.forEach((d) => map.set(d.date, d))
    return map
  }, [activityData])

  // Generate the past 365 days (or 52 weeks)
  const weeks = useMemo(() => {
    const result: { date: Date; dateStr: string }[][] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from 52 weeks ago, aligned to Sunday
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)
    // Align to the previous Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    let currentWeek: { date: Date; dateStr: string }[] = []

    for (let i = 0; i < 371; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      if (date > today) break

      const dateStr = date.toISOString().split('T')[0]
      currentWeek.push({ date, dateStr })

      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [])

  // Get intensity level (0-4) based on activity count
  const getIntensityLevel = (count: number): number => {
    if (count === 0) return 0
    if (maxActivity === 0) return 1
    const ratio = count / maxActivity
    if (ratio <= 0.25) return 1
    if (ratio <= 0.5) return 2
    if (ratio <= 0.75) return 3
    return 4
  }

  // Get color class based on intensity
  const getColorClass = (level: number): string => {
    switch (level) {
      case 0:
        return 'bg-accent-light'
      case 1:
        return 'bg-primary/30'
      case 2:
        return 'bg-primary/50'
      case 3:
        return 'bg-primary/70'
      case 4:
        return 'bg-primary'
      default:
        return 'bg-accent-light'
    }
  }

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0]
      if (firstDay) {
        const month = firstDay.date.getMonth()
        if (month !== lastMonth) {
          labels.push({
            month: firstDay.date.toLocaleString('default', { month: 'short' }),
            weekIndex,
          })
          lastMonth = month
        }
      }
    })

    return labels
  }, [weeks])

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  // Calculate totals for the legend
  const totalActivity = activityData.reduce((sum, d) => sum + d.count, 0)

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <div className="h-5 w-20 bg-accent-light rounded animate-pulse"></div>
          <div className="h-4 w-40 bg-accent-light rounded mt-2 animate-pulse"></div>
        </div>
        <div className="p-5">
          <div className="h-[120px] bg-accent-light rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Activity</h2>
          <p className="text-sm text-text-muted mt-1">
            {totalActivity} activities in the last year
          </p>
        </div>
      </div>
      <div className="p-5 overflow-x-auto">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex mb-2 ml-8 gap-0">
            {monthLabels.map((label, i) => {
              const nextWeekIndex = i < monthLabels.length - 1 ? monthLabels[i + 1].weekIndex : weeks.length
              const width = (nextWeekIndex - label.weekIndex) * 15
              return (
                <div
                  key={i}
                  className="text-xs text-text-muted"
                  style={{ width: `${width}px` }}
                >
                  {label.month}
                </div>
              )
            })}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 text-xs text-text-muted">
              {dayLabels.map((day, i) => (
                <div key={i} className="h-[12px] flex items-center justify-end pr-1" style={{ width: '24px' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const activity = activityMap.get(day.dateStr)
                    const count = activity?.count || 0
                    const level = getIntensityLevel(count)

                    const tooltipLines = [
                      `${day.date.toLocaleDateString('default', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}: ${count} ${count === 1 ? 'activity' : 'activities'}`,
                    ]
                    if (activity) {
                      if (activity.applications > 0) tooltipLines.push(`${activity.applications} applications`)
                      if (activity.interviews > 0) tooltipLines.push(`${activity.interviews} interviews`)
                      if (activity.notes > 0) tooltipLines.push(`${activity.notes} notes`)
                      if (activity.stageChanges > 0) tooltipLines.push(`${activity.stageChanges} stage changes`)
                      if (activity.reminders > 0) tooltipLines.push(`${activity.reminders} reminders`)
                    }

                    return (
                      <div
                        key={day.dateStr}
                        className={`w-[12px] h-[12px] rounded-sm ${getColorClass(level)} cursor-pointer transition-all hover:ring-1 hover:ring-foreground/30`}
                        title={tooltipLines.join('\n')}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-text-muted">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-[12px] h-[12px] rounded-sm ${getColorClass(level)}`}
              />
            ))}
            <span className="text-xs text-text-muted">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
