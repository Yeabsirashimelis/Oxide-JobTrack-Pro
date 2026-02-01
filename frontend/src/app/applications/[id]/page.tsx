'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from "@/components/layout"
import Link from "next/link"
import { useAuth } from '@/context/AuthContext'
import {
  applicationsApi,
  interviewsApi,
  notesApi,
  remindersApi,
  PipelineStage,
  CreateInterviewData,
} from '@/lib/api'

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

const outcomeConfig: Record<string, { label: string; bg: string; text: string }> = {
  PASSED: { label: "Passed", bg: "bg-success-light", text: "text-success" },
  FAILED: { label: "Failed", bg: "bg-error-light", text: "text-error" },
  PENDING: { label: "Pending", bg: "bg-warning-light", text: "text-warning" },
}

const validTransitions: Record<PipelineStage, PipelineStage[]> = {
  SAVED: ["APPLIED", "WITHDRAWN"],
  APPLIED: ["SCREENING", "INTERVIEW", "REJECTED", "WITHDRAWN"],
  SCREENING: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
  OFFER: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const applicationId = params.id as string

  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false)
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newInterview, setNewInterview] = useState<Partial<CreateInterviewData>>({
    roundName: '',
    interviewerName: '',
    scheduledAt: '',
    mode: 'ONLINE',
  })
  const [newReminder, setNewReminder] = useState({ title: '', dueAt: '', type: 'GENERAL' as const })

  const { data, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationsApi.getById(token!, applicationId),
    enabled: !!token && !!applicationId,
  })

  const updateStageMutation = useMutation({
    mutationFn: (stage: PipelineStage) =>
      applicationsApi.update(token!, applicationId, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setIsStageModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => applicationsApi.delete(token!, applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      router.push('/applications')
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => notesApi.create(token!, { content, applicationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      setNewNoteContent('')
      setIsAddNoteOpen(false)
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(token!, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
  })

  const addInterviewMutation = useMutation({
    mutationFn: (data: CreateInterviewData) => interviewsApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      setNewInterview({ roundName: '', interviewerName: '', scheduledAt: '', mode: 'ONLINE' })
      setIsAddInterviewOpen(false)
    },
  })

  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) =>
      interviewsApi.update(token!, id, { outcome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
  })

  const addReminderMutation = useMutation({
    mutationFn: () => remindersApi.create(token!, { ...newReminder, applicationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setNewReminder({ title: '', dueAt: '', type: 'GENERAL' })
      setIsAddReminderOpen(false)
    },
    onError: (error) => {
      console.error('Failed to add reminder:', error)
      alert('Failed to add reminder: ' + (error as Error).message)
    },
  })

  const completeReminderMutation = useMutation({
    mutationFn: (id: string) => remindersApi.complete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['upcoming'] })
    },
  })

  const uncompleteReminderMutation = useMutation({
    mutationFn: (id: string) => remindersApi.uncomplete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['upcoming'] })
    },
  })

  const deleteReminderMutation = useMutation({
    mutationFn: (id: string) => remindersApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-accent-light rounded w-32"></div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent-light rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-accent-light rounded w-64 mb-2"></div>
                <div className="h-4 bg-accent-light rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !data?.application) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-error">Application not found or failed to load.</p>
          <Link href="/applications" className="text-primary hover:underline mt-2 inline-block">
            Back to Applications
          </Link>
        </div>
      </AppLayout>
    )
  }

  const application = data.application
  const stage = stageConfig[application.stage] || stageConfig.SAVED
  const pipelineEvents = application.pipelineEvents || []
  const interviews = application.interviews || []
  const notes = application.notes || []
  const reminders = application.reminders || []
  const allowedTransitions = validTransitions[application.stage as PipelineStage] || []

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  const formatSalary = () => {
    if (!application.salaryMin && !application.salaryMax) return null
    if (application.salaryMin && application.salaryMax) {
      return `$${(application.salaryMin / 1000).toFixed(0)}k - $${(application.salaryMax / 1000).toFixed(0)}k`
    }
    if (application.salaryMin) return `$${(application.salaryMin / 1000).toFixed(0)}k+`
    if (application.salaryMax) return `Up to $${(application.salaryMax / 1000).toFixed(0)}k`
    return null
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/applications" className="text-text-muted hover:text-foreground">
            Applications
          </Link>
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-foreground">{application.title}</span>
        </nav>

        {/* Application Header */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-accent">
                  {application.company?.name?.slice(0, 2).toUpperCase() || 'CO'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{application.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage.bg} ${stage.text}`}>
                    {stage.label}
                  </span>
                </div>
                {application.company && (
                  <Link
                    href={`/companies/${application.companyId}`}
                    className="text-primary hover:text-primary-hover mt-1 inline-block"
                  >
                    {application.company.name}
                  </Link>
                )}

                <div className="flex flex-wrap gap-4 mt-3">
                  {application.location && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {application.location}
                    </span>
                  )}
                  {application.workMode && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-text-muted capitalize">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {application.workMode.toLowerCase()}
                      {application.jobType && ` • ${application.jobType.replace('_', '-').toLowerCase()}`}
                    </span>
                  )}
                  {formatSalary() && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatSalary()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error-light transition-colors"
              >
                Delete
              </button>
              {allowedTransitions.length > 0 && (
                <button
                  onClick={() => setIsStageModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Update Stage
                </button>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="text-text-muted">Applied:</span>{" "}
              <span className="text-foreground">{formatDate(application.appliedAt)}</span>
            </div>
            {application.source && (
              <div>
                <span className="text-text-muted">Source:</span>{" "}
                <span className="text-foreground">{application.source}</span>
              </div>
            )}
            {application.jobUrl && (
              <div>
                <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  View Job Posting
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Interviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pipeline Timeline */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Pipeline Timeline</h2>
              </div>
              <div className="p-5">
                {pipelineEvents.length === 0 ? (
                  <p className="text-text-muted text-center py-4">No events yet</p>
                ) : (
                  <div className="relative">
                    {pipelineEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          {index < pipelineEvents.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{stageConfig[event.stage]?.label || event.stage}</span>
                            <span className="text-sm text-text-muted">{formatDate(event.createdAt)}</span>
                          </div>
                          {event.note && (
                            <p className="text-sm text-text-muted mt-1">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Interviews */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Interviews ({interviews.length})</h2>
                <button
                  onClick={() => setIsAddInterviewOpen(true)}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Add Interview
                </button>
              </div>
              {isAddInterviewOpen && (
                <div className="p-5 border-b border-border bg-accent-light/50">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newInterview.roundName}
                      onChange={(e) => setNewInterview({ ...newInterview, roundName: e.target.value })}
                      placeholder="Round name (e.g., Phone Screen)"
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={newInterview.interviewerName}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewerName: e.target.value })}
                      placeholder="Interviewer name"
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <input
                      type="datetime-local"
                      value={newInterview.scheduledAt}
                      onChange={(e) => setNewInterview({ ...newInterview, scheduledAt: e.target.value })}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <select
                      value={newInterview.mode}
                      onChange={(e) => setNewInterview({ ...newInterview, mode: e.target.value as 'ONLINE' | 'PHONE' | 'ONSITE' })}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="PHONE">Phone</option>
                      <option value="ONSITE">Onsite</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setIsAddInterviewOpen(false)}
                      className="px-3 py-1.5 text-sm text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addInterviewMutation.mutate({ ...newInterview, applicationId } as CreateInterviewData)}
                      disabled={!newInterview.roundName}
                      className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {interviews.length === 0 && !isAddInterviewOpen ? (
                <div className="p-8 text-center text-text-muted">No interviews scheduled</div>
              ) : (
                <div className="divide-y divide-border">
                  {interviews.map((interview) => {
                    const outcome = outcomeConfig[interview.outcome] || outcomeConfig.PENDING
                    return (
                      <div key={interview.id} className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">{interview.roundName}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${outcome.bg} ${outcome.text}`}>
                                {outcome.label}
                              </span>
                            </div>
                            {interview.interviewerName && (
                              <p className="text-sm text-text-muted mt-1">{interview.interviewerName}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-foreground">{formatDateTime(interview.scheduledAt)}</p>
                            <p className="text-text-muted">{interview.mode}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {interview.outcome !== 'PENDING' && (
                            <button
                              onClick={() => updateInterviewMutation.mutate({ id: interview.id, outcome: 'PENDING' })}
                              className="px-3 py-1 text-xs bg-warning-light text-warning rounded-lg hover:bg-warning/20"
                            >
                              Mark Pending
                            </button>
                          )}
                          {interview.outcome !== 'PASSED' && (
                            <button
                              onClick={() => updateInterviewMutation.mutate({ id: interview.id, outcome: 'PASSED' })}
                              className="px-3 py-1 text-xs bg-success-light text-success rounded-lg hover:bg-success/20"
                            >
                              Mark Passed
                            </button>
                          )}
                          {interview.outcome !== 'FAILED' && (
                            <button
                              onClick={() => updateInterviewMutation.mutate({ id: interview.id, outcome: 'FAILED' })}
                              className="px-3 py-1 text-xs bg-error-light text-error rounded-lg hover:bg-error/20"
                            >
                              Mark Failed
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Notes & Reminders */}
          <div className="space-y-6">
            {/* Notes */}
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
              <div className="p-4 space-y-3">
                {isAddNoteOpen && (
                  <div className="space-y-2">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write a note..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setIsAddNoteOpen(false); setNewNoteContent('') }} className="px-3 py-1.5 text-sm text-text-muted">Cancel</button>
                      <button
                        onClick={() => addNoteMutation.mutate(newNoteContent)}
                        disabled={!newNoteContent.trim()}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-accent-light rounded-lg group relative">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-text-muted mt-2">{formatDate(note.createdAt)}</p>
                    <button
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error"
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

            {/* Reminders */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Reminders</h2>
                <button
                  onClick={() => setIsAddReminderOpen(true)}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Add Reminder
                </button>
              </div>
              <div className="p-4 space-y-3">
                {isAddReminderOpen && (
                  <div className="space-y-2 p-3 bg-accent-light rounded-lg">
                    <input
                      type="text"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      placeholder="Reminder title"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <input
                      type="datetime-local"
                      value={newReminder.dueAt}
                      onChange={(e) => setNewReminder({ ...newReminder, dueAt: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddReminderOpen(false)} className="px-3 py-1.5 text-sm text-text-muted">Cancel</button>
                      <button
                        onClick={() => addReminderMutation.mutate()}
                        disabled={!newReminder.title || !newReminder.dueAt || addReminderMutation.isPending}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg disabled:opacity-50"
                      >
                        {addReminderMutation.isPending ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${reminder.status === 'COMPLETED' ? 'bg-success-light' : 'bg-warning-light'}`}
                  >
                    <input
                      type="checkbox"
                      checked={reminder.status === 'COMPLETED'}
                      onChange={() => {
                        if (reminder.status === 'COMPLETED') {
                          uncompleteReminderMutation.mutate(reminder.id)
                        } else {
                          completeReminderMutation.mutate(reminder.id)
                        }
                      }}
                      className="w-4 h-4 rounded border-border"
                      title={reminder.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${reminder.status === 'COMPLETED' ? 'line-through text-text-muted' : 'text-foreground'}`}>
                        {reminder.title}
                      </p>
                      <p className="text-xs text-text-muted">{formatDateTime(reminder.dueAt)}</p>
                    </div>
                    <button
                      onClick={() => deleteReminderMutation.mutate(reminder.id)}
                      className="text-text-muted hover:text-error p-1"
                      title="Delete reminder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {reminders.length === 0 && !isAddReminderOpen && (
                  <p className="text-sm text-text-muted text-center py-4">No reminders</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Stage Modal */}
      {isStageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Update Stage</h2>
            <p className="text-text-muted mb-4">Move this application to a new stage:</p>
            <div className="space-y-2">
              {allowedTransitions.map((newStage) => (
                <button
                  key={newStage}
                  onClick={() => updateStageMutation.mutate(newStage)}
                  disabled={updateStageMutation.isPending}
                  className="w-full px-4 py-3 text-left border border-border rounded-lg hover:bg-accent-light transition-colors flex items-center justify-between"
                >
                  <span>{stageConfig[newStage]?.label || newStage}</span>
                  <span className={`w-3 h-3 rounded-full ${stageConfig[newStage]?.bg?.replace('-light', '') || 'bg-accent'}`}></span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsStageModalOpen(false)}
              className="w-full mt-4 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Application</h2>
            <p className="text-text-muted mb-6">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-border rounded-lg">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-error text-white rounded-lg disabled:opacity-50"
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
