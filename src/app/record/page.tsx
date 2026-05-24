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
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col px-4 py-8">
      <Link href="/" className="mb-4 text-sm text-amber-500 hover:underline">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">New site quote</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Walk the site and describe work, quantities, and materials. We transcribe,
        price from SA suppliers, and build your quote.
      </p>

      <MediaRecorderPanel
        disabled={loading}
        onRecordingReady={(b, type) => {
          setBlob(b);
          setMediaType(type);
          setDemoTranscript("");
        }}
      />

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-zinc-400">
          Labour rate (ZAR/hour)
          <input
            type="number"
            value={labourRate}
            onChange={(e) => setLabourRate(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </label>

        <details className="rounded-lg border border-zinc-700 p-3">
          <summary className="cursor-pointer text-sm text-zinc-400">
            Demo: paste transcript instead (no API audio)
          </summary>
          <textarea
            className="mt-2 w-full rounded-lg bg-zinc-900 p-3 text-sm text-white"
            rows={5}
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
        <p className="mt-4 rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-amber-500 py-4 font-bold text-black disabled:opacity-50"
      >
        {loading ? "Generating quote…" : "Generate quote"}
      </button>
      {loading && (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Transcribing, extracting scope, checking supplier prices…
        </p>
      )}
    </main>
  );
}
