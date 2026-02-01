import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const notes = new Hono()

// All routes require authentication
notes.use('*', authMiddleware)

// Get all notes for user (can filter by type)
notes.get('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const companyId = c.req.query('companyId')
    const applicationId = c.req.query('applicationId')
    const interviewId = c.req.query('interviewId')

    const where: Record<string, unknown> = {}

    if (companyId) {
      where.companyId = companyId
      where.company = { userId }
    } else if (applicationId) {
      where.applicationId = applicationId
      where.application = { userId }
    } else if (interviewId) {
      where.interviewId = interviewId
      where.interview = { application: { userId } }
    } else {
      // Get all notes for user across all entities
      where.OR = [
        { company: { userId } },
        { application: { userId } },
        { interview: { application: { userId } } }
      ]
    }

    const noteList = await prisma.note.findMany({
      where,
      include: {
        company: true,
        application: {
          include: { company: true }
        },
        interview: {
          include: {
            application: {
              include: { company: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return c.json({ notes: noteList })
  } catch (error) {
    console.error('Get notes error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single note
notes.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { company: { userId } },
          { application: { userId } },
          { interview: { application: { userId } } }
        ]
      },
      include: {
        company: true,
        application: {
          include: { company: true }
        },
        interview: {
          include: {
            application: {
              include: { company: true }
            }
          }
        }
      }
    })

    if (!note) {
      return c.json({ error: 'Note not found' }, 404)
    }

    return c.json({ note })
  } catch (error) {
    console.error('Get note error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create note
notes.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.content) {
      return c.json({ error: 'Content is required' }, 400)
    }

    // Must have exactly one parent entity
    const parentCount = [data.companyId, data.applicationId, data.interviewId].filter(Boolean).length
    if (parentCount !== 1) {
      return c.json({ error: 'Note must belong to exactly one entity (company, application, or interview)' }, 400)
    }

    // Verify ownership of parent entity
    if (data.companyId) {
      const company = await prisma.company.findFirst({
        where: { id: data.companyId, userId }
      })
      if (!company) {
        return c.json({ error: 'Company not found' }, 404)
      }
    }

    if (data.applicationId) {
      const application = await prisma.jobApplication.findFirst({
        where: { id: data.applicationId, userId }
      })
      if (!application) {
        return c.json({ error: 'Application not found' }, 404)
      }
    }

    if (data.interviewId) {
      const interview = await prisma.interview.findFirst({
        where: {
          id: data.interviewId,
          application: { userId }
        }
      })
      if (!interview) {
        return c.json({ error: 'Interview not found' }, 404)
      }
    }

    const note = await prisma.note.create({
      data: {
        content: data.content,
        companyId: data.companyId,
        applicationId: data.applicationId,
        interviewId: data.interviewId
      },
      include: {
        company: true,
        application: {
          include: { company: true }
        },
        interview: true
      }
    })

    return c.json({ message: 'Note created', note }, 201)
  } catch (error) {
    console.error('Create note error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update note
notes.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { company: { userId } },
          { application: { userId } },
          { interview: { application: { userId } } }
        ]
      }
    })

    if (!existing) {
      return c.json({ error: 'Note not found' }, 404)
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        content: data.content
      },
      include: {
        company: true,
        application: {
          include: { company: true }
        },
        interview: true
      }
    })

    return c.json({ message: 'Note updated', note })
  } catch (error) {
    console.error('Update note error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete note
notes.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { company: { userId } },
          { application: { userId } },
          { interview: { application: { userId } } }
        ]
      }
    })

    if (!existing) {
      return c.json({ error: 'Note not found' }, 404)
    }

    await prisma.note.delete({
      where: { id }
    })

    return c.json({ message: 'Note deleted' })
  } catch (error) {
    console.error('Delete note error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default notes
