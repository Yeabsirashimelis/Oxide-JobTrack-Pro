"use client";

import { useState, useEffect } from "react";

interface Job {
  id: number;
  title: string;
  company: string;
  status: string;
}

interface ApiHealth {
  status: string;
  timestamp: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, jobsRes] = await Promise.all([
          fetch("http://localhost:3001/api/health"),
          fetch("http://localhost:3001/api/jobs"),
        ]);

        if (!healthRes.ok || !jobsRes.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const healthData = await healthRes.json();
        const jobsData = await jobsRes.json();

        setHealth(healthData);
        setJobs(jobsData.jobs);
      } catch (err) {
        setError(
          "Could not connect to API. Make sure the backend is running on port 3001."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "interview":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "offer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            JobTrack Pro
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Track your job applications
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* API Status */}
        <div className="mb-8 p-4 rounded-lg bg-white dark:bg-zinc-800 shadow">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            API Status
          </h2>
          {loading ? (
            <p className="text-zinc-500">Checking API connection...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-green-600 dark:text-green-400">
                Connected
              </span>
              <span className="text-zinc-500 text-sm ml-2">
                Last checked: {health?.timestamp}
              </span>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Your Applications
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-zinc-500">
              Loading jobs...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-zinc-500">
              Unable to load jobs
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No job applications yet
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      {job.company}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(job.status)}`}
                  >
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tech Stack Info */}
        <div className="mt-8 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Built with{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              Next.js
            </span>{" "}
            +{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              Hono
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
