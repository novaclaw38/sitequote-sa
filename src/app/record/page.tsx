"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MediaRecorderPanel } from "@/components/MediaRecorder";
import { DEFAULT_LABOUR_RATE_ZAR } from "@/lib/constants";

type Step = 1 | 2 | 3;

const LOADING_MSGS = [
  "Transcribing audio…",
  "Extracting scope & quantities…",
  "Checking live SA supplier prices…",
  "Building your quote…",
];

export default function RecordPage() {
  const router = useRouter();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [labourRate, setLabourRate] = useState(DEFAULT_LABOUR_RATE_ZAR);
  const [demoTranscript, setDemoTranscript] = useState("");

  const step: Step = loading ? 2 : 1;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.contractor?.labourRateZar) setLabourRate(d.contractor.labourRateZar);
      });
  }, []);

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const t = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MSGS.length);
    }, 2800);
    return () => clearInterval(t);
  }, [loading]);

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
        setError("Record a note or paste a transcript below.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/quotes", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate quote");
      router.push(`/quotes/${data.quote.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-5 py-8 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-6 self-start">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </Link>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((n) => {
          const dotClass =
            step > n ? "step-dot-done" :
            step === n ? "step-dot-active" :
            "step-dot-inactive";
          const labelColor =
            step > n ? "text-green-400/70" :
            step === n ? "text-amber-400" :
            "text-zinc-600";
          const labels = ["Describe site", "Generating", "Review quote"];
          return (
            <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`step-dot ${dotClass}`}>
                {step > n ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : n}
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${labelColor}`}>
                {labels[n - 1]}
              </span>
              {n < 3 && (
                <div className={`flex-1 h-px mx-2 ${step > n ? "bg-green-400/20" : "bg-white/[0.06]"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New site quote</h1>
        <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
          Walk the site and describe the work — we transcribe, price from SA suppliers, and build your quote.
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
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Labour rate (ZAR/hour)
          </span>
          <div className="relative mt-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold pointer-events-none">R</span>
            <input
              type="number"
              value={labourRate}
              onChange={(e) => setLabourRate(Number(e.target.value))}
              className="input !pl-8"
            />
          </div>
          <p className="text-[11px] text-zinc-600 mt-1.5">Applied to all labour line items in the quote.</p>
        </label>

        <details className="glass-static p-4 group">
          <summary className="cursor-pointer text-sm text-zinc-400 font-semibold flex items-center gap-2 select-none">
            <svg className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Or paste transcript / description
          </summary>
          <p className="text-xs text-zinc-600 mt-2 mb-3">Skip recording — type or paste a site description and we'll extract scope directly.</p>
          <textarea
            className="input min-h-[130px] resize-y"
            placeholder="e.g. Bathroom renovation in Sandton. Remove old tiles, 8 sq metres. New porcelain tiles. Replace toilet and basin. 3 days labour for tiler and plumber."
            value={demoTranscript}
            onChange={(e) => {
              setDemoTranscript(e.target.value);
              if (e.target.value) setBlob(null);
            }}
          />
        </details>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3">
          <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading || (!blob && !demoTranscript.trim())}
        className="btn-primary w-full mt-6 py-5 rounded-2xl text-lg"
      >
        {loading && <span className="spinner" />}
        {loading ? "Generating quote…" : "Generate quote"}
      </button>

      {loading && (
        <div className="mt-5 space-y-3">
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
          <p className="text-xs text-zinc-500 text-center font-medium transition-all">
            {LOADING_MSGS[loadingMsgIdx]}
          </p>
        </div>
      )}
    </main>
  );
}
