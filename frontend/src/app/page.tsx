export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          JobTrack Pro
        </h1>
        <p className="text-text-muted mb-8">
          Personal Job Application & Career Pipeline Management System
        </p>

        {/* Theme Preview */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Theme Preview
          </h2>

          {/* Color Swatches */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-primary"></div>
              <span className="text-sm text-text-muted">Primary</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-secondary"></div>
              <span className="text-sm text-text-muted">Secondary</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-accent"></div>
              <span className="text-sm text-text-muted">Accent</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-info"></div>
              <span className="text-sm text-text-muted">Info</span>
            </div>
          </div>

          {/* Status Colors */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-success"></div>
              <span className="text-sm text-text-muted">Success</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-warning"></div>
              <span className="text-sm text-text-muted">Warning</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-12 rounded-md bg-error"></div>
              <span className="text-sm text-text-muted">Error</span>
            </div>
          </div>

          {/* Sample Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-light transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-accent-light text-foreground rounded-md hover:bg-border transition-colors">
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
