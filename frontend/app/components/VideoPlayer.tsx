import { useRef } from "react";

interface Props {
  videoFile: File;
  timestamps: [number, number][];
}

export default function VideoPlayer({ videoFile, timestamps }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  const jump = (start: number) => {
    if (ref.current) {
      ref.current.currentTime = start;
      ref.current.play();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <video
        ref={ref}
        src={URL.createObjectURL(videoFile)}
        controls
        className="w-full rounded-xl shadow-lg border border-gray-200"
      />
      <h2 className="mt-6 font-semibold text-lg text-gray-700">Appearances</h2>
      {timestamps.length === 0 ? (
        <p className="text-gray-400 mt-2">Face not found <span className="text-xl">🤷‍♂️</span></p>
      ) : (
        <ul className="flex flex-wrap gap-3 mt-3">
          {timestamps.map(([start, end], i) => (
            <li key={i}>
              <button
                onClick={() => jump(start)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full shadow border border-blue-200 hover:bg-blue-100 focus:ring-2 focus:ring-blue-300 transition-all text-sm font-medium"
              >
                {start.toFixed(1)}s - {end.toFixed(1)}s
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
