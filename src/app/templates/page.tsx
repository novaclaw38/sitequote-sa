"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JOB_TEMPLATES, type JobTemplate } from "@/lib/templates";

export default function TemplatesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<JobTemplate | null>(null);
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (template: JobTemplate) => {
    setError(null);
    setSelected(template);
    setValues(
      Object.fromEntries(template.inputs.map((i) => [i.key, i.default])),
    );
  };

  const generate = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, inputs: values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate quote");
      router.push(`/quotes/${data.quote.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="page-enter mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-5 py-8">
      <Link href="/" className="btn-secondary mb-6 inline-flex self-start !text-xs">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Start from a job template</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          Pick a common South African building job and enter a measurement or
          two. We pre-fill materials and labour, priced from your list first.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {JOB_TEMPLATES.map((t) => {
          const active = selected?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t)}
              className={`glass flex flex-col gap-2 p-4 text-left ${
                active ? "!border-emerald-500 ring-2 ring-emerald-500/30" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={t.icon} /></svg>
              </div>
              <span className="font-medium text-slate-100">{t.name}</span>
              <span className="text-xs leading-relaxed text-slate-500">{t.blurb}</span>
            </button>
          );
        })}
      </div>

      {/* Measurements + generate */}
      {selected && (
        <div className="page-enter mt-6">
          <div className="glass-static space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">{selected.name}</h2>
              <p className="mt-1 text-xs text-slate-500">Enter measurements — you can fine-tune every line afterwards.</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              {selected.inputs.map((input) => (
                <label key={input.key} className="block flex-1">
                  <span className="text-xs font-medium text-slate-400">
                    {input.label} ({input.unit})
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={input.min}
                    step={input.step ?? 1}
                    className="input num mt-2"
                    value={values[input.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        [input.key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  {input.hint && (
                    <span className="mt-1 block text-[11px] text-slate-600">{input.hint}</span>
                  )}
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-600 bg-rose-600/10 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading && <span className="spinner" />}
              {loading ? "Building quote…" : "Generate quote"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
