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

export default dashboard
