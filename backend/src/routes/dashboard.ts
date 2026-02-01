import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const dashboard = new Hono()

dashboard.use('*', authMiddleware)

// GET /dashboard/stats - Get dashboard statistics
dashboard.get('/stats', async (c) => {
  try {
    const { userId } = c.get('user')

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Get all applications for the user
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      select: {
        id: true,
        stage: true,
        createdAt: true,
        appliedAt: true,
      },
    })

    // Calculate stats
    const totalApplications = applications.length
    const applicationsThisWeek = applications.filter(
      (a) => new Date(a.createdAt) >= startOfWeek
    ).length

    // In progress = APPLIED, SCREENING, INTERVIEW stages
    const inProgressStages = ['APPLIED', 'SCREENING', 'INTERVIEW']
    const inProgress = applications.filter((a) =>
      inProgressStages.includes(a.stage)
    ).length

    // Offers
    const offers = applications.filter((a) => a.stage === 'OFFER').length
    const accepted = applications.filter((a) => a.stage === 'ACCEPTED').length

    // Get interviews count and upcoming
    const interviews = await prisma.interview.findMany({
      where: {
        application: { userId },
      },
      select: {
        id: true,
        scheduledAt: true,
        outcome: true,
      },
    })

    const totalInterviews = interviews.length
    const upcomingInterviews = interviews.filter(
      (i) => i.scheduledAt && new Date(i.scheduledAt) >= now && i.outcome === 'PENDING'
    ).length

    // Success rate (offers / total applications that moved past SAVED)
    const appliedApplications = applications.filter((a) => a.stage !== 'SAVED').length
    const successRate = appliedApplications > 0
      ? ((offers + accepted) / appliedApplications * 100).toFixed(1)
      : '0.0'

    return c.json({
      stats: {
        totalApplications,
        applicationsThisWeek,
        inProgress,
        totalInterviews,
        upcomingInterviews,
        offers: offers + accepted,
        successRate,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /dashboard/recent-applications - Get recent applications
dashboard.get('/recent-applications', async (c) => {
  try {
    const { userId } = c.get('user')
    const limit = parseInt(c.req.query('limit') || '5')

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    })

    return c.json({ applications })
  } catch (error) {
    console.error('Get recent applications error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /dashboard/upcoming - Get upcoming reminders and interviews
dashboard.get('/upcoming', async (c) => {
  try {
    const { userId } = c.get('user')
    const limit = parseInt(c.req.query('limit') || '5')
    const now = new Date()

    // Get upcoming reminders
    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueAt: { gte: now },
      },
      orderBy: { dueAt: 'asc' },
      take: limit,
      include: {
        application: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    })

    // Get upcoming interviews
    const interviews = await prisma.interview.findMany({
      where: {
        application: { userId },
        outcome: 'PENDING',
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        application: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    })

    return c.json({ reminders, interviews })
  } catch (error) {
    console.error('Get upcoming error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /dashboard/activity-heatmap - Get daily activity for heatmap
dashboard.get('/activity-heatmap', async (c) => {
  try {
    const { userId } = c.get('user')
    const days = parseInt(c.req.query('days') || '365')

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get all activity data in parallel
    const [applications, interviews, notes, pipelineEvents, reminders] = await Promise.all([
      // Applications created
      prisma.jobApplication.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      // Interviews created
      prisma.interview.findMany({
        where: {
          application: { userId },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      // Notes created
      prisma.note.findMany({
        where: {
          OR: [
            { company: { userId } },
            { application: { userId } },
            { interview: { application: { userId } } },
          ],
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      // Pipeline events (stage changes)
      prisma.pipelineEvent.findMany({
        where: {
          application: { userId },
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      // Reminders created
      prisma.reminder.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
    ])

    // Aggregate activity by date
    const activityMap: Record<string, { count: number; applications: number; interviews: number; notes: number; stageChanges: number; reminders: number }> = {}

    // Helper to add activity to a date
    const addActivity = (date: Date, type: 'applications' | 'interviews' | 'notes' | 'stageChanges' | 'reminders') => {
      const dateStr = date.toISOString().split('T')[0]
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = { count: 0, applications: 0, interviews: 0, notes: 0, stageChanges: 0, reminders: 0 }
      }
      activityMap[dateStr][type]++
      activityMap[dateStr].count++
    }

    applications.forEach((a) => addActivity(new Date(a.createdAt), 'applications'))
    interviews.forEach((i) => addActivity(new Date(i.createdAt), 'interviews'))
    notes.forEach((n) => addActivity(new Date(n.createdAt), 'notes'))
    pipelineEvents.forEach((p) => addActivity(new Date(p.createdAt), 'stageChanges'))
    reminders.forEach((r) => addActivity(new Date(r.createdAt), 'reminders'))

    // Convert to array format for frontend
    const activity = Object.entries(activityMap).map(([date, data]) => ({
      date,
      ...data,
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Calculate total activity
    const totalActivity = activity.reduce((sum, a) => sum + a.count, 0)
    const maxDailyActivity = Math.max(...activity.map((a) => a.count), 0)

    return c.json({
      activity,
      summary: {
        totalActivity,
        maxDailyActivity,
        daysWithActivity: activity.length,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error('Get activity heatmap error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default dashboard
