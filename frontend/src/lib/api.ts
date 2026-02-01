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
