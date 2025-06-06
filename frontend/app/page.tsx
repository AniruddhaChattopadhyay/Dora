"use client";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col">
      <nav className="flex justify-between items-center p-6">
        <span className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-blue-500" />
          DORA : Find Faces in Videos
        </span>
        <Button asChild size="lg" className="px-6 py-2 text-base font-semibold">
          <a href="/app">Explore</a>
        </Button>
      </nav>
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <Image
            src="https://illustrations.popsy.co/gray/face-scan.svg"
            alt="Face scan illustration"
            width={256}
            height={256}
            className="w-64 mb-8 drop-shadow-lg"
          />
          <h1 className="text-5xl font-bold mb-4 text-gray-900 text-center">
            Find Faces in Your Videos
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl text-center">
            Upload a video and a reference photo to detect appearances of a face. Fast, private, and easy to use.
          </p>
          <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg">
            <a href="/app">Get Started</a>
          </Button>
        </div>
      </main>
    </div>
  );
}
