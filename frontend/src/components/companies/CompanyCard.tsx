import Link from "next/link";
import { Company } from "@/lib/api";

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const activeApplications = company._count?.applications || 0;

  return (
    <Link href={`/companies/${company.id}`}>
      <div className="bg-surface border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg font-semibold text-accent">
              {company.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {company.name}
            </h3>
            <p className="text-sm text-text-muted">{company.industry || 'No industry'}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          {company.location && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{company.location}</span>
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{company.size}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-lg font-semibold text-foreground">{activeApplications}</p>
            <p className="text-xs text-text-muted">Applications</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">{company._count?.notes || 0}</p>
            <p className="text-xs text-text-muted">Notes</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
