"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MediaRecorderPanel } from "@/components/MediaRecorder";
import { DEFAULT_LABOUR_RATE_ZAR } from "@/lib/constants";

export default function RecordPage() {
  const router = useRouter();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labourRate, setLabourRate] = useState(DEFAULT_LABOUR_RATE_ZAR);
  const [demoTranscript, setDemoTranscript] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.contractor?.labourRateZar) {
          setLabourRate(d.contractor.labourRateZar);
        }
      });
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("labourRateZar", String(labourRate));
      formData.append("markupPercent", "15");

      if (demoTranscript.trim()) {
        formData.append("transcript", demoTranscript.trim());
      } else if (blob) {
        if (mediaType === "video") {
          formData.append("video", blob, "site-walk.webm");
        } else {
          formData.append("audio", blob, "voice-note.webm");
        }
      } else {
        setError("Record a note or paste demo text below.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/quotes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate quote");

      router.push(`/quotes/${data.quote.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-5 py-8 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-6 self-start">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New site quote</h1>
        <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
          Walk the site and describe work, quantities, and materials. We transcribe,
          price from SA suppliers, and build your quote.
        </p>
      </div>

      <MediaRecorderPanel
        disabled={loading}
        onRecordingReady={(b, type) => {
          setBlob(b);
          setMediaType(type);
          setDemoTranscript("");
        }}
      />

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Labour rate (ZAR/hour)</span>
          <input
            type="number"
            value={labourRate}
            onChange={(e) => setLabourRate(Number(e.target.value))}
            className="input mt-2"
          />
        </label>

        <details className="glass-static p-4 group">
          <summary className="cursor-pointer text-sm text-zinc-400 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            Demo: paste transcript instead
          </summary>
          <textarea
            className="input mt-3 min-h-[120px] resize-y"
            placeholder="e.g. Bathroom renovation in Sandton. Remove old tiles 8 square metres. New porcelain tiles. Replace toilet and basin. 3 days labour for tiler and plumber."
            value={demoTranscript}
            onChange={(e) => {
              setDemoTranscript(e.target.value);
              if (e.target.value) setBlob(null);
            }}
          />
        </details>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="btn-primary w-full mt-6 py-5 rounded-2xl text-lg"
      >
        {loading && <span className="spinner" />}
        {loading ? "Generating quote…" : "Generate quote"}
      </button>

      {loading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-500 animate-pulse">
            Transcribing → Extracting scope → Checking supplier prices…
          </p>
        </div>
      )}
    </main>
  );
}
