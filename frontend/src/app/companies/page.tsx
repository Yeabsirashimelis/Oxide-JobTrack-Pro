import { AppLayout } from "@/components/layout";
import { CompanyList } from "@/components/companies";

export default function CompaniesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Companies</h1>
            <p className="text-text-muted mt-1">
              Manage companies and view linked applications
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Company
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
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
              placeholder="Search companies..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Industries</option>
            <option value="technology">Technology</option>
            <option value="fintech">Fintech</option>
            <option value="e-commerce">E-commerce</option>
            <option value="design">Design</option>
          </select>

          <select className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Sort by</option>
            <option value="name">Name A-Z</option>
            <option value="applications">Most Applications</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 p-4 bg-surface border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">8</span>
            <span className="text-sm text-text-muted">Total Companies</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">6</span>
            <span className="text-sm text-text-muted">With Active Applications</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-success">16</span>
            <span className="text-sm text-text-muted">Total Applications</span>
          </div>
        </div>

        {/* Company List */}
        <CompanyList />
      </div>
    </AppLayout>
  );
}
