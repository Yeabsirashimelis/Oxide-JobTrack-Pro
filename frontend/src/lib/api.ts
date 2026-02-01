const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

interface ApiError {
  error: string
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Something went wrong')
  }

  return data as T
}

// Auth API
export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  location: string | null
  linkedIn: string | null
  desiredTitle: string | null
  preferredWorkMode: string | null
  salaryMin: number | null
  salaryMax: number | null
  emailNotifications: boolean
  browserNotifications: boolean
  weeklySummary: boolean
  defaultFollowUpDays: number
  interviewReminderDays: number
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: credentials }),

  register: (credentials: RegisterCredentials) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body: credentials }),

  getMe: (token: string) =>
    api<{ user: User }>('/auth/me', { token }),

  updateMe: (token: string, data: Partial<User>) =>
    api<{ user: User }>('/auth/me', { method: 'PATCH', body: data, token }),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    api<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      token,
    }),

  exportData: (token: string) =>
    api<{ data: unknown }>('/auth/export', { token }),

  deleteAccount: (token: string, password: string) =>
    api<{ message: string }>('/auth/account', {
      method: 'DELETE',
      body: { password },
      token,
    }),
}

// Companies API
export interface Company {
  id: string
  name: string
  industry: string | null
  size: string | null
  location: string | null
  website: string | null
  description: string | null
  userId: string
  createdAt: string
  updatedAt: string
  _count?: {
    applications: number
    notes: number
  }
  applications?: Application[]
  notes?: Note[]
}

export interface CreateCompanyData {
  name: string
  industry?: string
  size?: string
  location?: string
  website?: string
  description?: string
}

export const companiesApi = {
  getAll: (token: string) =>
    api<{ companies: Company[] }>('/companies', { token }),

  getById: (token: string, id: string) =>
    api<{ company: Company }>(`/companies/${id}`, { token }),

  create: (token: string, data: CreateCompanyData) =>
    api<{ message: string; company: Company }>('/companies', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (token: string, id: string, data: Partial<CreateCompanyData>) =>
    api<{ message: string; company: Company }>(`/companies/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    }),

  delete: (token: string, id: string) =>
    api<{ message: string }>(`/companies/${id}`, {
      method: 'DELETE',
      token,
    }),
}

// Applications API
export type PipelineStage = 'SAVED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

export interface PipelineEvent {
  id: string
  stage: PipelineStage
  note: string | null
  createdAt: string
  applicationId: string
}

export interface Interview {
  id: string
  roundName: string
  roundNumber: number
  interviewerName: string | null
  scheduledAt: string | null
  mode: 'ONLINE' | 'PHONE' | 'ONSITE'
  location: string | null
  outcome: 'PENDING' | 'PASSED' | 'FAILED'
  feedback: string | null
  applicationId: string
  createdAt: string
  updatedAt: string
  application?: Application
  notes?: Note[]
}

export interface Reminder {
  id: string
  title: string
  type: 'FOLLOW_UP' | 'INTERVIEW_PREP' | 'DEADLINE' | 'GENERAL'
  dueAt: string
  status: 'PENDING' | 'COMPLETED' | 'DISMISSED'
  userId: string
  applicationId: string | null
  createdAt: string
  updatedAt: string
  application?: Application
}

export interface Application {
  id: string
  title: string
  jobType: string | null
  workMode: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  source: string | null
  jobUrl: string | null
  description: string | null
  stage: PipelineStage
  appliedAt: string | null
  userId: string
  companyId: string
  resumeId: string | null
  createdAt: string
  updatedAt: string
  company?: Company
  pipelineEvents?: PipelineEvent[]
  interviews?: Interview[]
  notes?: Note[]
  reminders?: Reminder[]
  _count?: {
    interviews: number
    notes: number
    reminders: number
  }
}

export interface CreateApplicationData {
  title: string
  companyId: string
  jobType?: string
  workMode?: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  source?: string
  jobUrl?: string
  description?: string
  stage?: PipelineStage
  resumeId?: string
}

export const applicationsApi = {
  getAll: (token: string, params?: { stage?: string; companyId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.stage) searchParams.set('stage', params.stage)
    if (params?.companyId) searchParams.set('companyId', params.companyId)
    const query = searchParams.toString()
    return api<{ applications: Application[] }>(`/applications${query ? `?${query}` : ''}`, { token })
  },

  getById: (token: string, id: string) =>
    api<{ application: Application }>(`/applications/${id}`, { token }),

  create: (token: string, data: CreateApplicationData) =>
    api<{ message: string; application: Application }>('/applications', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (token: string, id: string, data: Partial<CreateApplicationData> & { stageNote?: string }) =>
    api<{ message: string; application: Application }>(`/applications/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    }),

  delete: (token: string, id: string) =>
    api<{ message: string }>(`/applications/${id}`, {
      method: 'DELETE',
      token,
    }),
}

// Interviews API
export interface CreateInterviewData {
  applicationId: string
  roundName: string
  roundNumber?: number
  interviewerName?: string
  scheduledAt?: string
  mode?: 'ONLINE' | 'PHONE' | 'ONSITE'
  location?: string
}

export const interviewsApi = {
  getAll: (token: string, params?: { applicationId?: string; upcoming?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.applicationId) searchParams.set('applicationId', params.applicationId)
    if (params?.upcoming) searchParams.set('upcoming', 'true')
    const query = searchParams.toString()
    return api<{ interviews: Interview[] }>(`/interviews${query ? `?${query}` : ''}`, { token })
  },

  getById: (token: string, id: string) =>
    api<{ interview: Interview }>(`/interviews/${id}`, { token }),

  create: (token: string, data: CreateInterviewData) =>
    api<{ message: string; interview: Interview }>('/interviews', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (token: string, id: string, data: Partial<CreateInterviewData> & { outcome?: string; feedback?: string }) =>
    api<{ message: string; interview: Interview }>(`/interviews/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    }),

  delete: (token: string, id: string) =>
    api<{ message: string }>(`/interviews/${id}`, {
      method: 'DELETE',
      token,
    }),
}

// Reminders API
export interface CreateReminderData {
  title: string
  type?: 'FOLLOW_UP' | 'INTERVIEW_PREP' | 'DEADLINE' | 'GENERAL'
  dueAt: string
  applicationId?: string
}

export const remindersApi = {
  getAll: (token: string, params?: { applicationId?: string; status?: string; upcoming?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.applicationId) searchParams.set('applicationId', params.applicationId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.upcoming) searchParams.set('upcoming', 'true')
    const query = searchParams.toString()
    return api<{ reminders: Reminder[] }>(`/reminders${query ? `?${query}` : ''}`, { token })
  },

  create: (token: string, data: CreateReminderData) =>
    api<{ message: string; reminder: Reminder }>('/reminders', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (token: string, id: string, data: Partial<CreateReminderData>) =>
    api<{ message: string; reminder: Reminder }>(`/reminders/${id}`, {
      method: 'PATCH',
      body: data,
      token,
    }),

  complete: (token: string, id: string) =>
    api<{ message: string; reminder: Reminder }>(`/reminders/${id}/complete`, {
      method: 'POST',
      token,
    }),

  uncomplete: (token: string, id: string) =>
    api<{ message: string; reminder: Reminder }>(`/reminders/${id}/uncomplete`, {
      method: 'POST',
      token,
    }),

  dismiss: (token: string, id: string) =>
    api<{ message: string; reminder: Reminder }>(`/reminders/${id}/dismiss`, {
      method: 'POST',
      token,
    }),

  delete: (token: string, id: string) =>
    api<{ message: string }>(`/reminders/${id}`, {
      method: 'DELETE',
      token,
    }),
}

// Dashboard API
export interface DashboardStats {
  totalApplications: number
  applicationsThisWeek: number
  inProgress: number
  totalInterviews: number
  upcomingInterviews: number
  offers: number
  successRate: string
}

export interface UpcomingInterview {
  id: string
  roundName: string
  scheduledAt: string
  mode: string
  application: {
    id: string
    title: string
    company: { name: string }
  }
}

export interface UpcomingReminder {
  id: string
  title: string
  type: string
  dueAt: string
  application: {
    id: string
    title: string
    company: { name: string }
  } | null
}

export const dashboardApi = {
  getStats: (token: string) =>
    api<{ stats: DashboardStats }>('/dashboard/stats', { token }),

  getRecentApplications: (token: string, limit = 5) =>
    api<{ applications: Application[] }>(`/dashboard/recent-applications?limit=${limit}`, { token }),

  getUpcoming: (token: string, limit = 5) =>
    api<{ reminders: UpcomingReminder[]; interviews: UpcomingInterview[] }>(`/dashboard/upcoming?limit=${limit}`, { token }),
}

// Analytics API
export interface AnalyticsMetrics {
  totalApplications: number
  interviewRate: number
  interviewCount: number
  offerRate: number
  offerCount: number
  avgResponseDays: number | null
}

export interface FunnelStage {
  name: string
  count: number
  percentage: number
}

export interface WeeklyActivity {
  week: string
  applications: number
  interviews: number
}

export interface StageBreakdownItem {
  stage: string
  count: number
  percentage: number
}

export interface SourceItem {
  source: string
  count: number
  interviews: number
  percentage: number
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics
  funnel: FunnelStage[]
  weeklyActivity: WeeklyActivity[]
  stageBreakdown: StageBreakdownItem[]
  sources: SourceItem[]
}

export const analyticsApi = {
  get: (token: string, days = 30) =>
    api<{ analytics: AnalyticsData }>(`/analytics?days=${days}`, { token }),
}

// Notes API
export interface Note {
  id: string
  content: string
  companyId: string | null
  applicationId: string | null
  interviewId: string | null
  createdAt: string
  updatedAt: string
}

export const notesApi = {
  getAll: (token: string, params?: { companyId?: string; applicationId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.companyId) searchParams.set('companyId', params.companyId)
    if (params?.applicationId) searchParams.set('applicationId', params.applicationId)
    const query = searchParams.toString()
    return api<{ notes: Note[] }>(`/notes${query ? `?${query}` : ''}`, { token })
  },

  create: (token: string, data: { content: string; companyId?: string; applicationId?: string; interviewId?: string }) =>
    api<{ message: string; note: Note }>('/notes', {
      method: 'POST',
      body: data,
      token,
    }),

  update: (token: string, id: string, content: string) =>
    api<{ message: string; note: Note }>(`/notes/${id}`, {
      method: 'PATCH',
      body: { content },
      token,
    }),

  delete: (token: string, id: string) =>
    api<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
      token,
    }),
}
