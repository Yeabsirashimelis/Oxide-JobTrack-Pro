"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { token } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword(token!, currentPassword, newPassword),
    onSuccess: () => {
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
    },
    onError: (error: Error) => {
      setPasswordError(error.message);
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    changePasswordMutation.mutate();
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-text-muted mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Appearance */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-text-muted">
                  Switch between light and dark theme
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    theme === "dark" ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-text-muted">
                  Receive email reminders for interviews and follow-ups
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-primary transition-colors">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full translate-x-6 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Browser Notifications</p>
                <p className="text-sm text-text-muted">
                  Get desktop notifications for upcoming events
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-border transition-colors">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly Summary</p>
                <p className="text-sm text-text-muted">
                  Receive a weekly summary of your job search activity
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-primary transition-colors">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full translate-x-6 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Reminders</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Default Follow-up Reminder
              </label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="3">3 days after applying</option>
                <option value="5">5 days after applying</option>
                <option value="7">7 days after applying</option>
                <option value="14">14 days after applying</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Interview Reminder
              </label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Data & Privacy</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Export Data</p>
                <p className="text-sm text-text-muted">
                  Download all your data in JSON format
                </p>
              </div>
              <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors">
                Export
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="font-medium text-error">Delete Account</p>
                <p className="text-sm text-text-muted">
                  Permanently delete your account and all data
                </p>
              </div>
              <button className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Account Security</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-sm text-text-muted">
                  Update your account password
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-text-muted">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Change Password</h2>
              <button
                onClick={closeModal}
                className="text-text-muted hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
                  {passwordSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
