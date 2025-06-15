"use client";
import { useState, FormEvent } from "react";
import { startJob } from "@/app/lib/api";
import UploadVideo from "./UploadVideo";
import UploadReference from "./UploadReference";

interface Props {
  onStart: (jobId: string, videoFile: File, videoUrl: string, faceUrl: string) => void;
}

/* pick files → POST /jobs → bubble up jobId */
export default function UploadForm({ onStart }: Props) {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [face, setFace] = useState<File | null>(null);
  const [faceUrl, setFaceUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!video || !face || !videoUrl || !faceUrl) return;

    const { id } = await startJob(video, face, videoUrl, faceUrl);
    onStart(id, video, videoUrl, faceUrl);         // lift state to parent
  }

  const handleVideoUpload = (file: File, url: string) => {
    setVideo(file);
    setVideoUrl(url);
  };

  const handleFaceUpload = (file: File, url: string) => {
    setFace(file);
    setFaceUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Video (mp4)
          <span className="block text-xs text-gray-400 mb-1">Upload an .mp4 video file</span>
          <UploadVideo onUpload={handleVideoUpload} />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Reference face
          <span className="block text-xs text-gray-400 mb-1">Upload a reference face image</span>
          <UploadReference onUpload={handleFaceUpload} />
        </label>
      </div>
      <div className="border-t my-2" />
      <button
        disabled={!video || !face || !videoUrl || !faceUrl}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        Start
      </button>
    </form>
  );
}
