import { AppLayout } from "@/components/layout";
import { StatsCards, UpcomingReminders, RecentApplications } from "@/components/dashboard";

export default function Home() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-text-muted mt-1">
            Welcome back! Here&apos;s your job search overview.
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reminders - 1 column */}
          <div className="lg:col-span-1">
            <UpcomingReminders />
          </div>

          {/* Recent Applications - 2 columns */}
          <div className="lg:col-span-2">
            <RecentApplications />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
