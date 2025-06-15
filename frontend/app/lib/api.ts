import axios from "axios";
import { createBrowserClient } from "@supabase/ssr";

const API_URL = "http://localhost:8000"; // Backend API URL
const NEXT_API_URL = "/api"; // Next.js API routes

export interface JobStatus {
  id: string;
  userId: string;
  status: string;
  videoName?: string;
  faceName?: string;
  videoUrl?: string;
  faceUrl?: string;
  appearances?: [number, number][];
  createdAt: Date;
  updatedAt: Date;
}

// Create an axios instance with auth header
const createAuthenticatedClient = async () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
export const startJob = async (video: File, face: File, videoUrl: string, faceUrl: string): Promise<JobStatus> => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to start a job");
  }

  // Create job using Next.js API route
  const formData = new FormData();
  formData.append("video", video);
  formData.append("face", face);
  formData.append("videoUrl", videoUrl);
  formData.append("faceUrl", faceUrl);

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
  backendFormData.append("video_url", videoUrl);
  backendFormData.append("face_url", faceUrl);
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
