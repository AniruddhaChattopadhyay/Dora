"use client";
import { useEffect, useState } from "react";
import { JobStatus, fetchUserJobs } from "@/app/lib/api";

export default function JobList() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadJobs = async () => {
      try {
        const userJobs = await fetchUserJobs();
        setJobs(userJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadJobs, 10000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted || loading) {
    return <div className="animate-pulse">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (jobs.length === 0) {
    return <div className="text-gray-500">No jobs found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {job.videoName || "Untitled Video"}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(job.createdAt || "").toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === "done"
                    ? "bg-green-100 text-green-800"
                    : job.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {job.status}
              </span>
            </div>
            {job.appearances && job.appearances.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Found {job.appearances.length} appearances
                </p>
                <div className="mt-1 space-y-1">
                  {job.appearances.map(([start, end], index) => (
                    <div
                      key={index}
                      className="text-sm bg-gray-50 p-2 rounded"
                    >
                      {start}s - {end}s
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 