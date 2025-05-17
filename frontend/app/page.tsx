"use client";
import { useState, useEffect } from "react";
import UploadForm from "@/app/components/UploadForm";
import VideoPlayer from "@/app/components/VideoPlayer";
import { fetchJob, JobStatus } from "@/app/lib/api";

export default function Home() {
  const [jobId, setJobId]       = useState<string | null>(null);
  const [status, setStatus]     = useState<JobStatus | null>(null);
  const [timestamps, setTs]     = useState<[number, number][]>([]);
  const [videoFile, setVideo]   = useState<File | null>(null);

  /* ─ poll every second when a job starts ─ */
  useEffect(() => {
    if (!jobId) return;

    const iv = setInterval(async () => {
      const { status, appearances = [] } = await fetchJob(jobId);
      console.log("status", status);
      setStatus(status);
      if (status === "done") {
        setTs(appearances);
        clearInterval(iv);
      }
    }, 1000);

    return () => clearInterval(iv);
  }, [jobId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 font-sans">
      <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center">
        <span className="text-4xl mb-2">🔎</span>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Find-Me MVP</h1>
        <p className="mb-6 text-gray-500 text-center">Find appearances of a face in your video.</p>
        {!jobId && (
          <UploadForm
            onStart={(id, video) => {
              setJobId(id);
              setStatus("queued");
              setVideo(video);
            }}
          />
        )}
        {status && status !== "done" && (
          <div className="w-full flex flex-col items-center mt-4">
            <span className="italic text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Status: <span className="font-medium">{status}</span></span>
          </div>
        )}
        {status === "done" && videoFile && (
          <div className="w-full mt-6">
            <VideoPlayer videoFile={videoFile} timestamps={timestamps} />
          </div>
        )}
      </div>
    </main>
  );
}
