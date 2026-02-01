import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const interviews = new Hono()

// All routes require authentication
interviews.use('*', authMiddleware)

// Get all interviews for user (across all applications)
interviews.get('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const applicationId = c.req.query('applicationId')
    const upcoming = c.req.query('upcoming')

    const where: Record<string, unknown> = {
      application: { userId }
    }

    if (applicationId) {
      where.applicationId = applicationId
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() }
      where.outcome = 'PENDING'
    }

    const interviewList = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: { company: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return c.json({ interviews: interviewList })
  } catch (error) {
    console.error('Get interviews error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single interview
interviews.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        application: { userId }
      },
      include: {
        application: {
          include: { company: true }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!interview) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    return c.json({ interview })
  } catch (error) {
    console.error('Get interview error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create interview
interviews.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.applicationId || !data.roundName) {
      return c.json({ error: 'Application ID and round name are required' }, 400)
    }

    // Verify application belongs to user
    const application = await prisma.jobApplication.findFirst({
      where: { id: data.applicationId, userId }
    })

    if (!application) {
      return c.json({ error: 'Application not found' }, 404)
    }

    // Get current interview count for round number
    const interviewCount = await prisma.interview.count({
      where: { applicationId: data.applicationId }
    })

    const interview = await prisma.interview.create({
      data: {
        roundName: data.roundName,
        roundNumber: data.roundNumber || interviewCount + 1,
        interviewerName: data.interviewerName,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        mode: data.mode || 'ONLINE',
        location: data.location,
        outcome: 'PENDING',
        applicationId: data.applicationId
      },
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Interview created', interview }, 201)
  } catch (error) {
    console.error('Create interview error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update interview
interviews.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.interview.findFirst({
      where: {
        id,
        application: { userId }
      }
    })

    if (!existing) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    if (data.scheduledAt) {
      data.scheduledAt = new Date(data.scheduledAt)
    }

    const interview = await prisma.interview.update({
      where: { id },
      data,
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Interview updated', interview })
  } catch (error) {
    console.error('Update interview error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete interview
interviews.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.interview.findFirst({
      where: {
        id,
        application: { userId }
      }
    })

    if (!existing) {
      return c.json({ error: 'Interview not found' }, 404)
    }

    await prisma.interview.delete({
      where: { id }
    })

    return c.json({ message: 'Interview deleted' })
  } catch (error) {
    console.error('Delete interview error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default interviews
