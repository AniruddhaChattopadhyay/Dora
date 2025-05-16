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
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Find-Me MVP</h1>

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
        <p className="italic">
          Status: <span className="font-medium">{status}</span>
        </p>
      )}

      {status === "done" && videoFile && (
        <VideoPlayer videoFile={videoFile} timestamps={timestamps} />
      )}
    </main>
  );
}
