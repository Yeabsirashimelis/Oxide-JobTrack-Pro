import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const reminders = new Hono()

// All routes require authentication
reminders.use('*', authMiddleware)

// Get all reminders for user
reminders.get('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const status = c.req.query('status')
    const applicationId = c.req.query('applicationId')
    const upcoming = c.req.query('upcoming')

    const where: Record<string, unknown> = { userId }

    if (status) {
      where.status = status
    }

    if (applicationId) {
      where.applicationId = applicationId
    }

    if (upcoming === 'true') {
      where.dueAt = { gte: new Date() }
      where.status = 'PENDING'
    }

    const reminderList = await prisma.reminder.findMany({
      where,
      include: {
        application: {
          include: { company: true }
        }
      },
      orderBy: { dueAt: 'asc' }
    })

    return c.json({ reminders: reminderList })
  } catch (error) {
    console.error('Get reminders error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single reminder
reminders.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    if (!reminder) {
      return c.json({ error: 'Reminder not found' }, 404)
    }

    return c.json({ reminder })
  } catch (error) {
    console.error('Get reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create reminder
reminders.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.title || !data.dueAt) {
      return c.json({ error: 'Title and due date are required' }, 400)
    }

    // If application is specified, verify ownership
    if (data.applicationId) {
      const application = await prisma.jobApplication.findFirst({
        where: { id: data.applicationId, userId }
      })
      if (!application) {
        return c.json({ error: 'Application not found' }, 404)
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        type: data.type || 'GENERAL',
        dueAt: new Date(data.dueAt),
        status: 'PENDING',
        userId,
        applicationId: data.applicationId
      },
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Reminder created', reminder }, 201)
  } catch (error) {
    console.error('Create reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update reminder
reminders.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.reminder.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Reminder not found' }, 404)
    }

    if (data.dueAt) {
      data.dueAt = new Date(data.dueAt)
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data,
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Reminder updated', reminder })
  } catch (error) {
    console.error('Update reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Mark reminder as completed
reminders.post('/:id/complete', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.reminder.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Reminder not found' }, 404)
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Reminder completed', reminder })
  } catch (error) {
    console.error('Complete reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Dismiss reminder
reminders.post('/:id/dismiss', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.reminder.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Reminder not found' }, 404)
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { status: 'DISMISSED' },
      include: {
        application: {
          include: { company: true }
        }
      }
    })

    return c.json({ message: 'Reminder dismissed', reminder })
  } catch (error) {
    console.error('Dismiss reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete reminder
reminders.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.reminder.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Reminder not found' }, 404)
    }

    await prisma.reminder.delete({
      where: { id }
    })

    return c.json({ message: 'Reminder deleted' })
  } catch (error) {
    console.error('Delete reminder error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default reminders
