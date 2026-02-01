import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const companies = new Hono()

// All routes require authentication
companies.use('*', authMiddleware)

// Get all companies for user
companies.get('/', async (c) => {
  try {
    const { userId } = c.get('user')

    const userCompanies = await prisma.company.findMany({
      where: { userId },
      include: {
        _count: {
          select: { applications: true, notes: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return c.json({ companies: userCompanies })
  } catch (error) {
    console.error('Get companies error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get single company
companies.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    const company = await prisma.company.findFirst({
      where: { id, userId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!company) {
      return c.json({ error: 'Company not found' }, 404)
    }

    return c.json({ company })
  } catch (error) {
    console.error('Get company error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create company
companies.post('/', async (c) => {
  try {
    const { userId } = c.get('user')
    const data = await c.req.json()

    if (!data.name) {
      return c.json({ error: 'Company name is required' }, 400)
    }

    const company = await prisma.company.create({
      data: {
        ...data,
        userId
      }
    })

    return c.json({ message: 'Company created', company }, 201)
  } catch (error) {
    console.error('Create company error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update company
companies.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()
    const data = await c.req.json()

    // Check ownership
    const existing = await prisma.company.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Company not found' }, 404)
    }

    const company = await prisma.company.update({
      where: { id },
      data
    })

    return c.json({ message: 'Company updated', company })
  } catch (error) {
    console.error('Update company error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete company
companies.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user')
    const { id } = c.req.param()

    // Check ownership
    const existing = await prisma.company.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return c.json({ error: 'Company not found' }, 404)
    }

    await prisma.company.delete({
      where: { id }
    })

    return c.json({ message: 'Company deleted' })
  } catch (error) {
    console.error('Delete company error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default companies
