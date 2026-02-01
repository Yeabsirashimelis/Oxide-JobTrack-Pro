'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from "@/components/layout"
import Link from "next/link"
import { useAuth } from '@/context/AuthContext'
import { companiesApi, notesApi, CreateCompanyData, Company } from '@/lib/api'

const stageConfig: Record<string, { label: string; bg: string; text: string }> = {
  SAVED: { label: "Saved", bg: "bg-accent-light", text: "text-accent" },
  APPLIED: { label: "Applied", bg: "bg-info-light", text: "text-info" },
  SCREENING: { label: "Screening", bg: "bg-warning-light", text: "text-warning" },
  INTERVIEW: { label: "Interview", bg: "bg-primary-light", text: "text-primary" },
  OFFER: { label: "Offer", bg: "bg-secondary/10", text: "text-secondary" },
  ACCEPTED: { label: "Accepted", bg: "bg-success-light", text: "text-success" },
  REJECTED: { label: "Rejected", bg: "bg-error-light", text: "text-error" },
  WITHDRAWN: { label: "Withdrawn", bg: "bg-accent-light", text: "text-text-muted" },
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const companyId = params.id as string

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editFormData, setEditFormData] = useState<CreateCompanyData>({
    name: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    description: '',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companiesApi.getById(token!, companyId),
    enabled: !!token && !!companyId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCompanyData>) => companiesApi.update(token!, companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsEditModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => companiesApi.delete(token!, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      router.push('/companies')
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => notesApi.create(token!, { content, companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      setNewNoteContent('')
      setIsAddNoteOpen(false)
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(token!, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
    },
  })

  const handleEditClick = () => {
    if (data?.company) {
      setEditFormData({
        name: data.company.name,
        industry: data.company.industry || '',
        size: data.company.size || '',
        location: data.company.location || '',
        website: data.company.website || '',
        description: data.company.description || '',
      })
      setIsEditModalOpen(true)
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(editFormData)
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return
    addNoteMutation.mutate(newNoteContent)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-accent-light rounded w-32"></div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-accent-light rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-accent-light rounded w-48 mb-2"></div>
                <div className="h-4 bg-accent-light rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !data?.company) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-error">Company not found or failed to load.</p>
          <Link href="/companies" className="text-primary hover:underline mt-2 inline-block">
            Back to Companies
          </Link>
        </div>
      </AppLayout>
    )
  }

  const company = data.company
  const applications = company.applications || []
  const notes = company.notes || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/companies" className="text-text-muted hover:text-foreground">
            Companies
          </Link>
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-foreground">{company.name}</span>
        </nav>

        {/* Company Header */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-accent">
                {company.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                  <p className="text-text-muted mt-1">{company.industry || 'No industry specified'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error-light transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {company.location && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {company.location}
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {company.size}
                  </div>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {company.website}
                  </a>
                )}
              </div>

              {company.description && (
                <p className="mt-4 text-sm text-text-muted">{company.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Applications ({applications.length})</h2>
                <Link
                  href={`/applications/new?companyId=${companyId}`}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Add Application
                </Link>
              </div>
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-text-muted">No applications yet for this company.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {applications.map((app) => {
                    const stage = stageConfig[app.stage] || stageConfig.SAVED
                    return (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-accent-light transition-colors"
                      >
                        <div>
                          <h3 className="font-medium text-foreground">{app.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-muted">
                              {app.appliedAt
                                ? new Date(app.appliedAt).toLocaleDateString()
                                : 'Not applied yet'}
                            </span>
                            {app.workMode && (
                              <span className="text-xs text-text-muted capitalize">
                                {app.workMode.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage.bg} ${stage.text}`}>
                          {stage.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Notes</h2>
                <button
                  onClick={() => setIsAddNoteOpen(true)}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Add Note
                </button>
              </div>
              <div className="p-4 space-y-4">
                {isAddNoteOpen && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write a note..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddNoteOpen(false)
                          setNewNoteContent('')
                        }}
                        className="px-3 py-1.5 text-sm text-text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addNoteMutation.isPending}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                      >
                        {addNoteMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-accent-light rounded-lg group relative">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {notes.length === 0 && !isAddNoteOpen && (
                  <p className="text-sm text-text-muted text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Edit Company</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-text-muted hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Company Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Industry</label>
                  <input
                    type="text"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Company Size</label>
                  <select
                    value={editFormData.size}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select size</option>
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="501-1000 employees">501-1000 employees</option>
                    <option value="1001-5000 employees">1001-5000 employees</option>
                    <option value="5001-10000 employees">5001-10000 employees</option>
                    <option value="10000+ employees">10000+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Website</label>
                <input
                  type="url"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-error">
                  {updateMutation.error?.message || 'Failed to update company'}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Company</h2>
            <p className="text-text-muted mb-6">
              Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
              {applications.length > 0 && (
                <span className="block mt-2 text-warning">
                  Warning: This company has {applications.length} application(s) that will also be affected.
                </span>
              )}
            </p>

            {deleteMutation.isError && (
              <p className="text-sm text-error mb-4">
                {deleteMutation.error?.message || 'Failed to delete company'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
