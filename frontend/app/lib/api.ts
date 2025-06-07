import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const API_URL = "http://localhost:8000"; // Backend API URL
const NEXT_API_URL = "/api"; // Next.js API routes

export interface JobStatus {
  id: string;
  userId: string;
  status: string;
  videoName?: string;
  faceName?: string;
  appearances?: [number, number][];
  createdAt: Date;
  updatedAt: Date;
}

// Create an axios instance with auth header
const createAuthenticatedClient = async () => {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("No authentication token available");
  }

  return axios.create({
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};

/* ---------- create a job ---------- */
export const startJob = async (video: File, face: File): Promise<JobStatus> => {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to start a job");
  }

  // Create job using Next.js API route
  const formData = new FormData();
  formData.append("video", video);
  formData.append("face", face);

  const response = await fetch(`${NEXT_API_URL}/jobs`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create job');
  }

  const job = await response.json();

  // Start the processing with the backend service
  const client = await createAuthenticatedClient();
  const backendFormData = new FormData();
  backendFormData.append("video", video);
  backendFormData.append("face", face);
  backendFormData.append("job_id", job.id);
  backendFormData.append("user_id", user.id);

  const backendResponse = await client.post(`${API_URL}/jobs/`, backendFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return { ...job, ...backendResponse.data };
};

/* ---------- poll a job ---------- */
export const fetchJob = async (jobId: string): Promise<JobStatus> => {
  const client = await createAuthenticatedClient();

  // First check Redis for active job status
  const backendResponse = await client.get(`${API_URL}/jobs/${jobId}`);
  const activeStatus = backendResponse.data;

  // Then get the full job details from our Next.js API
  const response = await fetch(`${NEXT_API_URL}/jobs?id=${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job');
  }
  const job = await response.json();

  // If the job is active, use Redis status, otherwise use database status
  return activeStatus.status !== 'not_found' ? activeStatus : job;
};

/* ---------- fetch user's jobs ---------- */
export const fetchUserJobs = async (): Promise<JobStatus[]> => {
  const response = await fetch(`${NEXT_API_URL}/jobs`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const jobs = await response.json();

  // For active jobs, get their current status from Redis
  const client = await createAuthenticatedClient();
  const activeJobs = await Promise.all(
    jobs
      .filter((job: JobStatus) => ['queued', 'processing'].includes(job.status))
      .map(async (job: JobStatus) => {
        try {
          const activeStatus = await client.get(`${API_URL}/jobs/${job.id}`);
          return { ...job, ...activeStatus.data };
        } catch {
          return job;
        }
      })
  );

  // Combine active and completed jobs
  const completedJobs = jobs.filter((job: JobStatus) => !['queued', 'processing'].includes(job.status));
  return [...activeJobs, ...completedJobs];
};
