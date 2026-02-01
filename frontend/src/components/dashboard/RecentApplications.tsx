interface Application {
  id: number;
  title: string;
  company: string;
  stage: "saved" | "applied" | "screening" | "interview" | "offer";
  appliedDate: string;
  logo?: string;
}

const applications: Application[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    stage: "interview",
    appliedDate: "Jan 28, 2026",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "Startup Inc",
    stage: "screening",
    appliedDate: "Jan 25, 2026",
  },
  {
    id: 3,
    title: "Software Engineer",
    company: "Big Tech Co",
    stage: "offer",
    appliedDate: "Jan 20, 2026",
  },
  {
    id: 4,
    title: "React Developer",
    company: "Dev Agency",
    stage: "applied",
    appliedDate: "Jan 30, 2026",
  },
  {
    id: 5,
    title: "Backend Engineer",
    company: "Cloud Systems",
    stage: "saved",
    appliedDate: "Feb 1, 2026",
  },
];

const stageConfig = {
  saved: {
    label: "Saved",
    bg: "bg-accent-light",
    text: "text-accent",
  },
  applied: {
    label: "Applied",
    bg: "bg-info-light",
    text: "text-info",
  },
  screening: {
    label: "Screening",
    bg: "bg-warning-light",
    text: "text-warning",
  },
  interview: {
    label: "Interview",
    bg: "bg-primary-light",
    text: "text-primary",
  },
  offer: {
    label: "Offer",
    bg: "bg-success-light",
    text: "text-success",
  },
};

export default function RecentApplications() {
  return (
    <div className="bg-surface rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Recent Applications</h2>
        <button className="text-sm text-primary hover:text-primary-hover">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Position
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Company
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Stage
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Applied
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => {
              const stage = stageConfig[app.stage];
              return (
                <tr key={app.id} className="hover:bg-accent-light transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{app.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-accent">
                          {app.company.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-text-muted">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.bg} ${stage.text}`}
                    >
                      {stage.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-text-muted">{app.appliedDate}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-primary hover:text-primary-hover text-sm font-medium">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
