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
  stage: string
  appliedAt: string | null
  userId: string
  companyId: string
  resumeId: string | null
  createdAt: string
  updatedAt: string
  company?: Company
  _count?: {
    interviews: number
    notes: number
    reminders: number
  }
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
