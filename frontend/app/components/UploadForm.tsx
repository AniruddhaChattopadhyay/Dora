"use client";
import { useState, FormEvent } from "react";
import { createJob } from "@/app/lib/api";

interface Props {
  onStart: (jobId: string, videoFile: File) => void;
}

/* pick files → POST /jobs → bubble up jobId */
export default function UploadForm({ onStart }: Props) {
  const [video, setVideo] = useState<File | null>(null);
  const [face,  setFace]  = useState<File | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!video || !face) return;

    const { id } = await createJob(video, face);
    onStart(id, video);         // lift state to parent
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Video (mp4)
          <span className="block text-xs text-gray-400 mb-1">Upload an .mp4 video file</span>
          <div className="relative flex items-center">
            <input
              type="file"
              accept="video/*"
              onChange={e => setVideo(e.target.files?.[0] || null)}
              className="sr-only"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded shadow border border-blue-200 transition-all">
              {video ? "Change Video" : "Choose Video"}
            </label>
            {video && <span className="ml-3 text-sm text-gray-500 truncate max-w-[160px]">{video.name}</span>}
          </div>
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Reference face
          <span className="block text-xs text-gray-400 mb-1">Upload a reference face image</span>
          <div className="relative flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={e => setFace(e.target.files?.[0] || null)}
              className="sr-only"
              id="face-upload"
            />
            <label htmlFor="face-upload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded shadow border border-blue-200 transition-all">
              {face ? "Change Image" : "Choose Image"}
            </label>
            {face && <span className="ml-3 text-sm text-gray-500 truncate max-w-[160px]">{face.name}</span>}
          </div>
        </label>
      </div>
      <div className="border-t my-2" />
      <button
        disabled={!video || !face}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        Start
      </button>
    </form>
  );
}
