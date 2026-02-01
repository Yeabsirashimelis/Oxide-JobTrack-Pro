import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const resumes = new Hono()

// All routes require authentication
resumes.use('*', authMiddleware)

// Get all resumes for user
resumes.get('/', async (c) => {
  try {
    const { userId } = c.get('user')

    const resumeList = await prisma.resumeVersion.findMany({
      where: { userId },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return c.json({ resumes: resumeList })
  } catch (error) {
    console.error('Get resumes error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single resume
resumes.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const resume = await prisma.resumeVersion.findFirst({
      where: { id, userId },
      include: {
        applications: {
          include: { company: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!resume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    return c.json({ resume })
  } catch (error) {
    console.error('Get resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create resume
resumes.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.name || !data.fileName) {
      return c.json({ error: 'Name and file name are required' }, 400)
    }

    // If this is the first resume or marked as default, update others
    if (data.isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }

    // Check if user has any resumes
    const existingCount = await prisma.resumeVersion.count({
      where: { userId }
    })

    const resume = await prisma.resumeVersion.create({
      data: {
        name: data.name,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        isDefault: data.isDefault || existingCount === 0, // First resume is default
        userId
      }
    })

    return c.json({ message: 'Resume created', resume }, 201)
  } catch (error) {
    console.error('Create resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update resume
resumes.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.resumeVersion.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // If setting as default, unset others
    if (data.isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false }
      })
    }

    const resume = await prisma.resumeVersion.update({
      where: { id },
      data
    })

    return c.json({ message: 'Resume updated', resume })
  } catch (error) {
    console.error('Update resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Set resume as default
resumes.post('/:id/set-default', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.resumeVersion.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // Unset all others
    await prisma.resumeVersion.updateMany({
      where: { userId },
      data: { isDefault: false }
    })

    // Set this one as default
    const resume = await prisma.resumeVersion.update({
      where: { id },
      data: { isDefault: true }
    })

    return c.json({ message: 'Resume set as default', resume })
  } catch (error) {
    console.error('Set default resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete resume
resumes.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.resumeVersion.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // Check if any applications use this resume
    const applicationsCount = await prisma.jobApplication.count({
      where: { resumeId: id }
    })

    if (applicationsCount > 0) {
      return c.json({
        error: `Cannot delete resume. It is used by ${applicationsCount} application(s).`
      }, 400)
    }

    await prisma.resumeVersion.delete({
      where: { id }
    })

    // If this was the default, set another as default
    if (existing.isDefault) {
      const nextResume = await prisma.resumeVersion.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      if (nextResume) {
        await prisma.resumeVersion.update({
          where: { id: nextResume.id },
          data: { isDefault: true }
        })
      }
    }

    return c.json({ message: 'Resume deleted' })
  } catch (error) {
    console.error('Delete resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default resumes
