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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border p-4 rounded-lg">
      <label>
        <span className="font-medium">Video (mp4)</span>
        <input
          type="file"
          accept="video/*"
          onChange={e => setVideo(e.target.files?.[0] || null)}
          className="block mt-1"
        />
      </label>

      <label>
        <span className="font-medium">Reference face</span>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFace(e.target.files?.[0] || null)}
          className="block mt-1"
        />
      </label>

      <button
        disabled={!video || !face}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Start
      </button>
    </form>
  );
}
