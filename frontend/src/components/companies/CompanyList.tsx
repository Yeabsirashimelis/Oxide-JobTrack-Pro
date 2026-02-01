"use client";

import CompanyCard, { Company } from "./CompanyCard";

// Mock data - will be replaced with API data
const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Google",
    industry: "Technology",
    size: "10,000+ employees",
    location: "Mountain View, CA",
    website: "https://google.com",
    activeApplications: 2,
    totalApplications: 5,
  },
  {
    id: 2,
    name: "Meta",
    industry: "Technology",
    size: "10,000+ employees",
    location: "Menlo Park, CA",
    website: "https://meta.com",
    activeApplications: 1,
    totalApplications: 3,
  },
  {
    id: 3,
    name: "Netflix",
    industry: "Entertainment",
    size: "5,000-10,000 employees",
    location: "Los Angeles, CA",
    website: "https://netflix.com",
    activeApplications: 1,
    totalApplications: 2,
  },
  {
    id: 4,
    name: "Stripe",
    industry: "Fintech",
    size: "1,000-5,000 employees",
    location: "San Francisco, CA",
    website: "https://stripe.com",
    activeApplications: 1,
    totalApplications: 1,
  },
  {
    id: 5,
    name: "Vercel",
    industry: "Technology",
    size: "500-1,000 employees",
    location: "Remote",
    website: "https://vercel.com",
    activeApplications: 1,
    totalApplications: 2,
  },
  {
    id: 6,
    name: "Shopify",
    industry: "E-commerce",
    size: "5,000-10,000 employees",
    location: "Toronto, Canada",
    website: "https://shopify.com",
    activeApplications: 1,
    totalApplications: 1,
  },
  {
    id: 7,
    name: "Figma",
    industry: "Design",
    size: "500-1,000 employees",
    location: "San Francisco, CA",
    website: "https://figma.com",
    activeApplications: 0,
    totalApplications: 1,
  },
  {
    id: 8,
    name: "Notion",
    industry: "Productivity",
    size: "500-1,000 employees",
    location: "San Francisco, CA",
    website: "https://notion.so",
    activeApplications: 1,
    totalApplications: 1,
  },
];

export default function CompanyList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockCompanies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
