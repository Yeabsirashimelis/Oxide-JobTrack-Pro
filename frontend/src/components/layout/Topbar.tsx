"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi } from "@/lib/api";

export default function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, token } = useAuth();

  // Fetch upcoming reminders and interviews
  const { data: upcomingData } = useQuery({
    queryKey: ["upcoming-notifications"],
    queryFn: () => dashboardApi.getUpcoming(token!, 10),
    enabled: !!token,
    refetchInterval: 60000, // Refetch every minute
  });

  const reminders = upcomingData?.reminders || [];
  const interviews = upcomingData?.interviews || [];
  const notificationCount = reminders.length + interviews.length;

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || user.email.charAt(0).toUpperCase()
    : "?";

  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "User";

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search applications, companies..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 text-text-muted hover:text-foreground hover:bg-accent-light rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-error rounded-full flex items-center justify-center text-white text-xs font-medium">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>

              {notificationCount === 0 ? (
                <div className="px-4 py-8 text-center text-text-muted">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No upcoming notifications</p>
                </div>
              ) : (
                <div>
                  {/* Upcoming Interviews */}
                  {interviews.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-accent-light">
                        <p className="text-xs font-medium text-text-muted uppercase">Upcoming Interviews</p>
                      </div>
                      {interviews.map((interview) => (
                        <Link
                          key={interview.id}
                          href={`/applications/${interview.application.id}`}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block px-4 py-3 hover:bg-accent-light border-b border-border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {interview.roundName}
                              </p>
                              <p className="text-xs text-text-muted truncate">
                                {interview.application.company.name} - {interview.application.title}
                              </p>
                              <p className="text-xs text-primary mt-1">
                                {new Date(interview.scheduledAt).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Upcoming Reminders */}
                  {reminders.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-accent-light">
                        <p className="text-xs font-medium text-text-muted uppercase">Reminders</p>
                      </div>
                      {reminders.map((reminder) => (
                        <Link
                          key={reminder.id}
                          href={reminder.application ? `/applications/${reminder.application.id}` : "#"}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block px-4 py-3 hover:bg-accent-light border-b border-border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-warning/10 rounded-lg text-warning">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {reminder.title}
                              </p>
                              {reminder.application && (
                                <p className="text-xs text-text-muted truncate">
                                  {reminder.application.company.name} - {reminder.application.title}
                                </p>
                              )}
                              <p className="text-xs text-warning mt-1">
                                Due {new Date(reminder.dueAt).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:text-foreground hover:bg-accent-light rounded-lg transition-colors"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent-light transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{userInitials}</span>
            </div>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-text-muted hover:bg-accent-light hover:text-foreground"
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-text-muted hover:bg-accent-light hover:text-foreground"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-light"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
