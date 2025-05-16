import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface JobResponse {
  id: string;
  status: JobStatus;
  appearances?: [number, number][];
}

/* ---------- create a job ---------- */
export async function createJob(video: File, face: File): Promise<JobResponse> {
  const form = new FormData();
  form.append("video", video);
  form.append("face", face);

  const { data } = await axios.post<JobResponse>(
    `${base}/jobs`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/* ---------- poll a job ---------- */
export async function fetchJob(id: string): Promise<JobResponse> {
  const { data } = await axios.get<JobResponse>(`${base}/jobs/${id}`);
  return data;
}
