"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onRecordingReady: (blob: Blob, type: "audio" | "video") => void;
  disabled?: boolean;
};

export function MediaRecorderPanel({ onRecordingReady, disabled }: Props) {
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video",
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(
        stream,
        mode === "video"
          ? { mimeType: "video/webm" }
          : { mimeType },
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mode === "video" ? "video/webm" : mimeType,
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onRecordingReady(blob, mode);
        stopStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert(
        "Could not access microphone/camera. Allow permissions or use the native app.",
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => setMode("audio")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "audio"
              ? "bg-amber-500 text-black"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Voice note
        </button>
        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => setMode("video")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "video"
              ? "bg-amber-500 text-black"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          Site video
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-8">
        {recording ? (
          <p className="animate-pulse text-amber-400">Recording…</p>
        ) : (
          <p className="text-zinc-400 text-center text-sm">
            Describe the job: materials, sizes, labour, access issues.
          </p>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={recording ? stopRecording : startRecording}
          className={`h-20 w-20 rounded-full text-lg font-semibold ${
            recording
              ? "bg-red-600 text-white"
              : "bg-amber-500 text-black"
          }`}
        >
          {recording ? "Stop" : "Record"}
        </button>

        {previewUrl && mode === "audio" && (
          <audio src={previewUrl} controls className="w-full" />
        )}
        {previewUrl && mode === "video" && (
          <video src={previewUrl} controls className="w-full rounded-lg" />
        )}
      </div>

      <label className="block text-sm text-zinc-400">
        Or upload a file
        <input
          type="file"
          accept="audio/*,video/*"
          disabled={disabled}
          className="mt-2 block w-full text-sm text-zinc-300"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const type = file.type.startsWith("video") ? "video" : "audio";
            onRecordingReady(file, type);
            setPreviewUrl(URL.createObjectURL(file));
          }}
        />
      </label>
    </div>
  );
}
