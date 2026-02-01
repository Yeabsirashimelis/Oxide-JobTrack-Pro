import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import { hashPassword, verifyPassword, generateToken } from '../lib/auth.js'
import { authMiddleware } from '../middleware/auth.js'

const auth = new Hono()

// Register
auth.post('/register', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 409)
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    return c.json({
      message: 'User registered successfully',
      user,
      token,
    }, 201)
  } catch (error) {
    console.error('Register error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get current user (protected)
auth.get('/me', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        linkedIn: true,
        desiredTitle: true,
        preferredWorkMode: true,
        salaryMin: true,
        salaryMax: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update current user (protected)
auth.patch('/me', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user')
    const updates = await c.req.json()

    // Don't allow updating email or password through this route
    delete updates.email
    delete updates.password
    delete updates.id

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        linkedIn: true,
        desiredTitle: true,
        preferredWorkMode: true,
        salaryMin: true,
        salaryMax: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return c.json({ message: 'User updated successfully', user })
  } catch (error) {
    console.error('Update user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Change password (protected)
auth.post('/change-password', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user')
    const { currentPassword, newPassword } = await c.req.json()

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400)
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'New password must be at least 6 characters' }, 400)
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password)

    if (!isValidPassword) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return c.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default auth
