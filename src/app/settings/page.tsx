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
      <main className="p-8 text-center text-zinc-400">Loading…</main>
    );
  }

  if (!contractor) {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-zinc-400">Please log in to manage settings.</p>
        <Link href="/login" className="mt-4 inline-block text-amber-500">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/" className="text-sm text-amber-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Settings</h1>
      <p className="text-sm text-zinc-500">{contractor.email}</p>

      <form onSubmit={save} className="mt-6 space-y-4">
        <label className="block text-sm text-zinc-400">
          Company name
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            value={contractor.companyName}
            onChange={(e) =>
              setContractor({ ...contractor, companyName: e.target.value })
            }
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Phone / WhatsApp
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            value={contractor.phone ?? ""}
            onChange={(e) =>
              setContractor({ ...contractor, phone: e.target.value || null })
            }
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Default labour rate (R/hour)
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
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
        <label className="block text-sm text-zinc-400">
          Default markup (%)
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            value={contractor.markupPercent}
            onChange={(e) =>
              setContractor({
                ...contractor,
                markupPercent: parseFloat(e.target.value) || 0,
              })
            }
          />
        </label>
        {message && (
          <p className="text-sm text-amber-400">{message}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-amber-500 py-3 font-bold text-black"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </main>
  );
}
