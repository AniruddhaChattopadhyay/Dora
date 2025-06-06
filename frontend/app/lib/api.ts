import axios from "axios";

const API_URL = "http://localhost:8000"; // Adjust if your backend runs on a different port

export interface JobStatus {
  id: string;
  status: string;
  appearances?: [number, number][];
}

/* ---------- create a job ---------- */
export const startJob = async (video: File, face: File): Promise<JobStatus> => {
  const formData = new FormData();
  formData.append("video", video);
  formData.append("face", face);

  const response = await axios.post(`${API_URL}/jobs/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/* ---------- poll a job ---------- */
export const fetchJob = async (jobId: string): Promise<JobStatus> => {
  const response = await axios.get(`${API_URL}/jobs/${jobId}`);
  return response.data;
};
