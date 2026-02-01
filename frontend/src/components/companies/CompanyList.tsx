"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { companiesApi, Company } from "@/lib/api";
import CompanyCard from "./CompanyCard";

interface CompanyListProps {
  searchQuery?: string;
  industryFilter?: string;
  sortBy?: string;
}

export default function CompanyList({ searchQuery = "", industryFilter = "", sortBy = "" }: CompanyListProps) {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.getAll(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-5 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-accent-light rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-accent-light rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-accent-light rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-accent-light rounded w-2/3"></div>
              <div className="h-4 bg-accent-light rounded w-1/2"></div>
            </div>
            <div className="pt-4 border-t border-border flex justify-between">
              <div className="h-8 bg-accent-light rounded w-16"></div>
              <div className="h-8 bg-accent-light rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Failed to load companies. Please try again.</p>
      </div>
    );
  }

  let companies = data?.companies || [];

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    companies = companies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.industry?.toLowerCase().includes(query) ||
        c.location?.toLowerCase().includes(query)
    );
  }

  // Apply industry filter
  if (industryFilter) {
    companies = companies.filter(
      (c) => c.industry?.toLowerCase() === industryFilter.toLowerCase()
    );
  }

  // Apply sorting
  if (sortBy === "name") {
    companies = [...companies].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "applications") {
    companies = [...companies].sort(
      (a, b) => (b._count?.applications || 0) - (a._count?.applications || 0)
    );
  } else if (sortBy === "recent") {
    companies = [...companies].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No companies yet</h3>
        <p className="text-text-muted">Add your first company to start tracking applications.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
