"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_LABOUR_RATE_ZAR } from "@/lib/constants";

type Contractor = {
  id: string;
  email: string;
  companyName: string;
  phone: string | null;
  labourRateZar: number;
  markupPercent: number;
};

export default function SettingsPage() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setContractor(d.contractor);
        setLoading(false);
      });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractor) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: contractor.companyName,
        phone: contractor.phone,
        labourRateZar: contractor.labourRateZar,
        markupPercent: contractor.markupPercent,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setContractor(data.contractor);
      setMessage("Settings saved");
    } else {
      setMessage(data.error ?? "Failed to save");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="spinner" />
      </main>
    );
  }

  if (!contractor) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-zinc-400 mb-4">Please log in to manage settings.</p>
        <Link href="/login" className="btn-primary">Log in</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md w-full px-5 py-8 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-6 inline-flex">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </Link>

      <div className="glass-static p-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">{contractor.email}</p>

        <form onSubmit={save} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Company name</span>
            <input
              className="input mt-2"
              value={contractor.companyName}
              onChange={(e) =>
                setContractor({ ...contractor, companyName: e.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Phone / WhatsApp</span>
            <input
              className="input mt-2"
              value={contractor.phone ?? ""}
              onChange={(e) =>
                setContractor({ ...contractor, phone: e.target.value || null })
              }
            />
          </label>

          <div className="flex gap-4">
            <label className="block flex-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Labour rate (R/hr)</span>
              <input
                type="number"
                className="input mt-2"
                value={contractor.labourRateZar}
                onChange={(e) =>
                  setContractor({
                    ...contractor,
                    labourRateZar:
                      parseFloat(e.target.value) || DEFAULT_LABOUR_RATE_ZAR,
                  })
                }
              />
            </label>
            <label className="block flex-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Markup (%)</span>
              <input
                type="number"
                className="input mt-2"
                value={contractor.markupPercent}
                onChange={(e) =>
                  setContractor({
                    ...contractor,
                    markupPercent: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </label>
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2.5">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <p className="text-sm text-green-300">{message}</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving && <span className="spinner" />}
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </div>
    </main>
  );
}
