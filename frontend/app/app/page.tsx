"use client";
import { useState, useEffect } from "react";
import VideoPlayer from "@/app/components/VideoPlayer";
import { fetchJob, startJob } from "@/app/lib/api";
import UploadVideo from "@/app/components/UploadVideo";
import UploadReference from "@/app/components/UploadReference";
import JobList from "@/app/components/JobList";

export default function AppPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [timestamps, setTs] = useState<[number, number][]>([]);
  const [videoFile, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [faceUrl, setFaceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const pollInterval = setInterval(async () => {
      try {
        const result = await fetchJob(jobId);
        setStatus(result.status);
        if (result.status === "done" && result.appearances) {
          setTs(result.appearances);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(pollInterval);
      }
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [jobId]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-blue-100 font-sans p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <span className="text-4xl mb-2">🔎</span>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-800">Face Detection in Videos</h1>
          <p className="mb-6 text-gray-500 text-center">Upload a video and a reference photo to detect faces.</p>
          {!jobId && (
            <div className="w-full flex flex-col md:flex-row gap-4 mb-6">
              <UploadVideo onUpload={(file, url) => {
                setVideo(file);
                setVideoUrl(url);
              }} />
              <UploadReference onUpload={(file, url) => {
                setReferencePhoto(file);
                setFaceUrl(url);
              }} />
            </div>
          )}
          {!jobId && (
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={async () => {
                if (videoFile && referencePhoto && videoUrl && faceUrl) {
                  try {
                    const result = await startJob(videoFile, referencePhoto, videoUrl, faceUrl);
                    setJobId(result.id);
                    setStatus(result.status);
                  } catch (error) {
                    console.error('Error starting job:', error);
                    alert('Failed to start face detection. Please try again.');
                  }
                } else {
                  alert('Please upload both a video and a reference photo.');
                }
              }}
            >
              Start Detection
            </button>
          )}
          {status && status !== "done" && (
            <div className="w-full flex flex-col items-center mt-4">
              <span className="italic text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Status: <span className="font-medium">{status}</span></span>
            </div>
          )}
          {status === "done" && timestamps.length > 0 && (
            <div className="w-full mt-6">
              <h2 className="text-xl font-semibold mb-2">Detection Results</h2>
              <ul className="list-disc pl-5">
                {timestamps.map(([start, end], index) => (
                  <li key={index} className="text-gray-700">
                    {start}s - {end}s
                  </li>
                ))}
              </ul>
            </div>
          )}
          {status === "done" && videoFile && (
            <div className="w-full mt-6">
              <VideoPlayer videoFile={videoFile} timestamps={timestamps} />
            </div>
          )}
        </div>

        {/* Job List Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <JobList />
        </div>
      </div>
    </main>
  );
} 