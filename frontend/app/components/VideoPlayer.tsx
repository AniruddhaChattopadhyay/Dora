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
    <>
      <video
        ref={ref}
        src={URL.createObjectURL(videoFile)}
        controls
        className="w-full rounded shadow"
      />

      <h2 className="mt-4 font-medium">Appearances</h2>
      {timestamps.length === 0 ? (
        <p>Face not found 🤷‍♂️</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {timestamps.map(([start, end], i) => (
            <li key={i}>
              <button
                onClick={() => jump(start)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                {start.toFixed(1)}s - {end.toFixed(1)}s
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
