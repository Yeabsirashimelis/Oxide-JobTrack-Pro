import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import auth from './routes/auth.js'
import companies from './routes/companies.js'
import applications from './routes/applications.js'
import interviews from './routes/interviews.js'
import notes from './routes/notes.js'
import reminders from './routes/reminders.js'
import resumes from './routes/resumes.js'
import dashboard from './routes/dashboard.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

// Mount routes
api.route('/auth', auth)
api.route('/companies', companies)
api.route('/applications', applications)
api.route('/interviews', interviews)
api.route('/notes', notes)
api.route('/reminders', reminders)
api.route('/resumes', resumes)
api.route('/dashboard', dashboard)

app.route('/api', api)

const port = Number(process.env.PORT) || 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
