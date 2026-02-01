import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const analytics = new Hono()

analytics.use('*', authMiddleware)

// GET /analytics - Get all analytics data
analytics.get('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const days = parseInt(c.req.query('days') || '30')

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)

    // Get all applications for the user within the time period
    const applications = await prisma.jobApplication.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        stage: true,
        source: true,
        createdAt: true,
        appliedAt: true,
      },
    })

    // Get all interviews for the user within the time period
    const interviews = await prisma.interview.findMany({
      where: {
        application: { userId },
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        scheduledAt: true,
        createdAt: true,
        applicationId: true,
      },
    })

    // Calculate stage counts for funnel
    const stageCounts: Record<string, number> = {
      SAVED: 0,
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEW: 0,
      OFFER: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    }

    applications.forEach((app) => {
      stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1
    })

    // Calculate funnel (cumulative - everyone who reached a stage)
    const totalApps = applications.length
    const appliedAndBeyond = applications.filter((a) => a.stage !== 'SAVED').length
    const screeningAndBeyond = applications.filter((a) =>
      ['SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.stage)
    ).length
    const interviewAndBeyond = applications.filter((a) =>
      ['INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.stage)
    ).length
    const offerAndBeyond = applications.filter((a) =>
      ['OFFER', 'ACCEPTED'].includes(a.stage)
    ).length
    const accepted = applications.filter((a) => a.stage === 'ACCEPTED').length

    const funnel = [
      { name: 'Applied', count: appliedAndBeyond, percentage: totalApps > 0 ? (appliedAndBeyond / totalApps) * 100 : 0 },
      { name: 'Screening', count: screeningAndBeyond, percentage: appliedAndBeyond > 0 ? (screeningAndBeyond / appliedAndBeyond) * 100 : 0 },
      { name: 'Interview', count: interviewAndBeyond, percentage: screeningAndBeyond > 0 ? (interviewAndBeyond / screeningAndBeyond) * 100 : 0 },
      { name: 'Offer', count: offerAndBeyond, percentage: interviewAndBeyond > 0 ? (offerAndBeyond / interviewAndBeyond) * 100 : 0 },
      { name: 'Accepted', count: accepted, percentage: offerAndBeyond > 0 ? (accepted / offerAndBeyond) * 100 : 0 },
    ]

    // Calculate weekly activity
    const weeks: { week: string; startDate: Date; applications: number; interviews: number }[] = []
    const numWeeks = Math.ceil(days / 7)

    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i + 1) * 7)
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() - i * 7)

      const weekApps = applications.filter((a) => {
        const date = new Date(a.createdAt)
        return date >= weekStart && date < weekEnd
      }).length

      const weekInterviews = interviews.filter((int) => {
        const date = new Date(int.createdAt)
        return date >= weekStart && date < weekEnd
      }).length

      weeks.push({
        week: `Week ${numWeeks - i}`,
        startDate: weekStart,
        applications: weekApps,
        interviews: weekInterviews,
      })
    }

    // Calculate source breakdown
    const sourceCounts: Record<string, { count: number; interviews: number }> = {}
    applications.forEach((app) => {
      const source = app.source || 'Unknown'
      if (!sourceCounts[source]) {
        sourceCounts[source] = { count: 0, interviews: 0 }
      }
      sourceCounts[source].count++
    })

    // Count interviews per source
    const appSources = new Map(applications.map((a) => [a.id, a.source || 'Unknown']))
    interviews.forEach((int) => {
      const source = appSources.get(int.applicationId)
      if (source && sourceCounts[source]) {
        sourceCounts[source].interviews++
      }
    })

    const sources = Object.entries(sourceCounts)
      .map(([source, data]) => ({
        source,
        count: data.count,
        interviews: data.interviews,
        percentage: totalApps > 0 ? (data.count / totalApps) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate metrics
    const interviewRate = appliedAndBeyond > 0 ? (interviewAndBeyond / appliedAndBeyond) * 100 : 0
    const offerRate = appliedAndBeyond > 0 ? (offerAndBeyond / appliedAndBeyond) * 100 : 0

    // Calculate average response time (from applied to first stage change)
    // For simplicity, we'll skip this complex calculation for now
    const avgResponseDays = null

    return c.json({
      analytics: {
        metrics: {
          totalApplications: totalApps,
          interviewRate: Math.round(interviewRate * 10) / 10,
          interviewCount: interviewAndBeyond,
          offerRate: Math.round(offerRate * 10) / 10,
          offerCount: offerAndBeyond,
          avgResponseDays,
        },
        funnel,
        weeklyActivity: weeks,
        stageBreakdown: Object.entries(stageCounts).map(([stage, count]) => ({
          stage,
          count,
          percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
        })),
        sources,
      },
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default analytics
