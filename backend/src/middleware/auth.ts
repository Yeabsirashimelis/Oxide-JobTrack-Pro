import { Context, Next } from 'hono'
import { verifyToken, JwtPayload } from '../lib/auth.js'

// Extend Hono's context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)

  if (!payload) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401)
  }

  // Set user in context for downstream handlers
  c.set('user', payload)

  await next()
}
