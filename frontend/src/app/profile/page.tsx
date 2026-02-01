'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from "@/components/layout"
import { useAuth } from '@/context/AuthContext'
import { authApi, User } from '@/lib/api'

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    desiredTitle: '',
    preferredWorkMode: '',
    salaryMin: '',
    salaryMax: '',
  })

  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        linkedIn: user.linkedIn || '',
        desiredTitle: user.desiredTitle || '',
        preferredWorkMode: user.preferredWorkMode || '',
        salaryMin: user.salaryMin?.toString() || '',
        salaryMax: user.salaryMax?.toString() || '',
      })
    }
  }, [user])

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!token) throw new Error('Not authenticated')
      return authApi.updateMe(token, data)
    },
    onSuccess: (response) => {
      updateUser(response.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      phone: formData.phone || null,
      location: formData.location || null,
      linkedIn: formData.linkedIn || null,
    })
  }

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      desiredTitle: formData.desiredTitle || null,
      preferredWorkMode: formData.preferredWorkMode || null,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
    })
  }

  const getInitials = () => {
    const first = formData.firstName?.[0] || ''
    const last = formData.lastName?.[0] || ''
    return (first + last).toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'
  }

  const getFullName = () => {
    const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ')
    return name || 'User'
  }

  const getMemberSince = () => {
    if (!user?.createdAt) return ''
    const date = new Date(user.createdAt)
    return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  }

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
          <p className="text-text-muted mt-1">
            Manage your personal information
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {updateProfileMutation.isError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {updateProfileMutation.error?.message || 'Failed to update profile'}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{getInitials()}</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-accent-light transition-colors">
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{getFullName()}</h2>
              <p className="text-text-muted">{formData.email}</p>
              <p className="text-sm text-text-muted mt-2">{getMemberSince()}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <form onSubmit={handlePersonalInfoSubmit} className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Personal Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-muted cursor-not-allowed"
              />
              <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Job Preferences */}
        <form onSubmit={handlePreferencesSubmit} className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Job Preferences</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Desired Job Title
              </label>
              <input
                type="text"
                value={formData.desiredTitle}
                onChange={(e) => setFormData({ ...formData, desiredTitle: e.target.value })}
                placeholder="Senior Software Engineer"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preferred Work Mode
              </label>
              <select
                value={formData.preferredWorkMode}
                onChange={(e) => setFormData({ ...formData, preferredWorkMode: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select preference</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Expected Salary Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="Min (e.g., 120000)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="Max (e.g., 180000)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
