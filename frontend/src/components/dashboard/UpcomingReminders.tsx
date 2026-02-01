interface Reminder {
  id: number;
  title: string;
  company: string;
  type: "interview" | "followup" | "deadline";
  date: string;
  time?: string;
}

const reminders: Reminder[] = [
  {
    id: 1,
    title: "Technical Interview",
    company: "Tech Corp",
    type: "interview",
    date: "Today",
    time: "2:00 PM",
  },
  {
    id: 2,
    title: "Follow up on application",
    company: "Startup Inc",
    type: "followup",
    date: "Tomorrow",
  },
  {
    id: 3,
    title: "Final Round Interview",
    company: "Big Tech Co",
    type: "interview",
    date: "Feb 5",
    time: "10:00 AM",
  },
  {
    id: 4,
    title: "Submit coding challenge",
    company: "Dev Agency",
    type: "deadline",
    date: "Feb 7",
  },
];

const typeConfig = {
  interview: {
    bg: "bg-primary-light",
    text: "text-primary",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  followup: {
    bg: "bg-warning-light",
    text: "text-warning",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  deadline: {
    bg: "bg-error-light",
    text: "text-error",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function UpcomingReminders() {
  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Upcoming Reminders</h2>
        <button className="text-sm text-primary hover:text-primary-hover">View all</button>
      </div>
      <div className="divide-y divide-border">
        {reminders.map((reminder) => {
          const config = typeConfig[reminder.type];
          return (
            <div
              key={reminder.id}
              className="px-5 py-3 flex items-center gap-4 hover:bg-accent-light transition-colors"
            >
              <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {reminder.title}
                </p>
                <p className="text-xs text-text-muted">{reminder.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{reminder.date}</p>
                {reminder.time && (
                  <p className="text-xs text-text-muted">{reminder.time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
