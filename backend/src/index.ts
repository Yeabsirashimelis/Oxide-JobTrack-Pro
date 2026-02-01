import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/', (c) => {
  return c.json({ message: 'JobTrack Pro API is running' })
})

// API routes
const api = new Hono()

api.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Example jobs routes
api.get('/jobs', (c) => {
  return c.json({
    jobs: [
      { id: 1, title: 'Software Engineer', company: 'Tech Corp', status: 'applied' },
      { id: 2, title: 'Frontend Developer', company: 'Startup Inc', status: 'interview' },
      { id: 3, title: 'Full Stack Developer', company: 'Big Tech', status: 'offer' },
    ]
  })
})

api.post('/jobs', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Job created', job: body }, 201)
})

app.route('/api', api)

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
