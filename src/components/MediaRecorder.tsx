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
      {/* Mode toggle */}
      <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => setMode("audio")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
            mode === "audio"
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          Voice note
        </button>
        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => setMode("video")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
            mode === "video"
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          Site video
        </button>
      </div>

      {/* Record area */}
      <div className="glass-static flex flex-col items-center gap-5 p-10">
        {recording ? (
          <div className="text-center">
            <div className="chip mb-3 inline-flex items-center gap-2 border-rose-600/30 bg-rose-600/10 text-rose-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              Recording…
            </div>
            <p className="text-xs text-slate-500">Tap the button to stop</p>
          </div>
        ) : (
          <p className="max-w-xs text-center text-sm leading-relaxed text-slate-400">
            Describe the job: materials, sizes, labour, access issues.
          </p>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={recording ? stopRecording : startRecording}
          className={`h-20 w-20 rounded-full text-lg font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            recording
              ? "pulse-ring bg-rose-600 text-white hover:bg-rose-500"
              : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95"
          }`}
        >
          {recording ? (
            <svg className="w-7 h-7 mx-auto" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
            <svg className="w-7 h-7 mx-auto" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          )}
        </button>

        {previewUrl && mode === "audio" && (
          <audio src={previewUrl} controls className="w-full mt-2" />
        )}
        {previewUrl && mode === "video" && (
          <video src={previewUrl} controls className="w-full rounded-xl mt-2" />
        )}
      </div>

      {/* Upload fallback */}
      <label className="glass-static flex cursor-pointer flex-col items-center gap-2 p-5 transition-all duration-200 ease-in-out hover:border-emerald-500/30">
        <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
        <span className="text-xs font-medium text-slate-400">Or upload a file</span>
        <input
          type="file"
          accept="audio/*,video/*"
          disabled={disabled}
          className="hidden"
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
