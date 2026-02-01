import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { PipelineStage } from '@prisma/client'

const applications = new Hono()

// All routes require authentication
applications.use('*', authMiddleware)

// Valid stage transitions
const validTransitions: Record<PipelineStage, PipelineStage[]> = {
  SAVED: ['APPLIED', 'WITHDRAWN'],
  APPLIED: ['SCREENING', 'INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

// Get all applications for user
applications.get('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const stage = c.req.query('stage')
    const companyId = c.req.query('companyId')

    const where: Record<string, unknown> = { userId }
    if (stage) where.stage = stage
    if (companyId) where.companyId = companyId

    const apps = await prisma.jobApplication.findMany({
      where,
      include: {
        company: true,
        _count: {
          select: { interviews: true, notes: true, reminders: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return c.json({ applications: apps })
  } catch (error) {
    console.error('Get applications error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single application with full details
applications.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const application = await prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        company: true,
        resume: true,
        pipelineEvents: {
          orderBy: { createdAt: 'desc' }
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        reminders: {
          orderBy: { dueAt: 'asc' }
        }
      }
    })

    if (!application) {
      return c.json({ error: 'Application not found' }, 404)
    }

    return c.json({ application })
  } catch (error) {
    console.error('Get application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create application
applications.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.title || !data.companyId) {
      return c.json({ error: 'Title and company are required' }, 400)
    }

    // Verify company belongs to user
    const company = await prisma.company.findFirst({
      where: { id: data.companyId, userId }
    })

    if (!company) {
      return c.json({ error: 'Company not found' }, 404)
    }

    const application = await prisma.jobApplication.create({
      data: {
        title: data.title,
        jobType: data.jobType,
        workMode: data.workMode,
        location: data.location,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        source: data.source,
        jobUrl: data.jobUrl,
        description: data.description,
        stage: data.stage || 'SAVED',
        appliedAt: data.stage === 'APPLIED' ? new Date() : null,
        userId,
        companyId: data.companyId,
        resumeId: data.resumeId
      },
      include: { company: true }
    })

    // Create initial pipeline event
    await prisma.pipelineEvent.create({
      data: {
        stage: application.stage,
        note: 'Application created',
        applicationId: application.id
      }
    })

    return c.json({ message: 'Application created', application }, 201)
  } catch (error) {
    console.error('Create application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update application
applications.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Application not found' }, 404)
    }

    // Handle stage transition
    if (data.stage && data.stage !== existing.stage) {
      const allowed = validTransitions[existing.stage]
      if (!allowed.includes(data.stage)) {
        return c.json({
          error: `Cannot transition from ${existing.stage} to ${data.stage}`
        }, 400)
      }

      // Set appliedAt when moving to APPLIED
      if (data.stage === 'APPLIED' && !existing.appliedAt) {
        data.appliedAt = new Date()
      }

      // Create pipeline event
      await prisma.pipelineEvent.create({
        data: {
          stage: data.stage,
          note: data.stageNote || `Moved to ${data.stage}`,
          applicationId: id
        }
      })
    }

    delete data.stageNote

    const application = await prisma.jobApplication.update({
      where: { id },
      data,
      include: { company: true }
    })

    return c.json({ message: 'Application updated', application })
  } catch (error) {
    console.error('Update application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete application
applications.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Application not found' }, 404)
    }

    await prisma.jobApplication.delete({
      where: { id }
    })

    return c.json({ message: 'Application deleted' })
  } catch (error) {
    console.error('Delete application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default applications
