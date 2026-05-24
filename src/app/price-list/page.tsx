"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatZar } from "@/lib/quote-schema";

type Item = {
  id: string;
  description: string;
  unit: string;
  unitPriceZar: number;
  searchQuery: string | null;
};

export default function PriceListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("each");
  const [unitPriceZar, setUnitPriceZar] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const load = () => {
    fetch("/api/price-list")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setItems(d.items);
        else if (d.error) setError(d.error);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/price-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        unit,
        unitPriceZar: parseFloat(unitPriceZar),
        searchQuery: searchQuery || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add");
      return;
    }
    setDescription("");
    setUnitPriceZar("");
    setSearchQuery("");
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/price-list/${id}`, { method: "DELETE" });
    load();
  };

  const importCsv = async (file: File) => {
    setImportMsg(null);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/price-list/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Import failed");
      return;
    }
    setImportMsg(`Imported ${data.imported} items`);
    load();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="spinner" />
      </main>
    );
  }

  if (error === "Not authenticated") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-zinc-400 mb-4">Log in to manage your price list.</p>
        <Link href="/login" className="btn-primary">Log in</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl w-full px-5 py-8 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-6 inline-flex">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Your price list</h1>
        <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
          Custom items entered here are referenced before checking live supplier databases during quote generation.
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={add} className="glass-static p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Add new item</h2>
          
          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Description</span>
            <input
              required
              className="input mt-2"
              placeholder="e.g. Porcelain tile 600x600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="flex gap-4">
            <label className="block flex-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Unit</span>
              <input
                className="input mt-2"
                placeholder="e.g. m², bag, each"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </label>
            <label className="block flex-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Price (ZAR)</span>
              <input
                type="number"
                required
                step="0.01"
                className="input mt-2"
                placeholder="0.00"
                value={unitPriceZar}
                onChange={(e) => setUnitPriceZar(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Match keywords <span className="text-zinc-600">(optional)</span></span>
            <input
              className="input mt-2"
              placeholder="e.g. tile porcelain 600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary w-full mt-2">
            Add item
          </button>
        </form>

        <div className="glass-static p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Import CSV</h2>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            File should contain columns for: <code className="text-amber-400 font-mono">description</code>, <code className="text-amber-400 font-mono">unit</code>, <code className="text-amber-400 font-mono">price</code>, and optional <code className="text-amber-400 font-mono">keywords</code>.
          </p>
          
          <label className="glass flex flex-col items-center gap-2 p-5 cursor-pointer hover:border-amber-500/20 transition-colors">
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            <span className="text-xs text-zinc-400 font-medium">Choose CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCsv(f);
              }}
            />
          </label>

          {importMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <p className="text-xs text-green-300">{importMsg}</p>
            </div>
          )}
        </div>

        {error && error !== "Not authenticated" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
              Price list items ({items.length})
            </h2>
            <div className="divider flex-1" />
          </div>

          {items.length === 0 ? (
            <div className="glass-static p-8 text-center text-zinc-500 text-sm">
              No items yet. Add them above or upload a CSV file.
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="glass p-4 flex items-center justify-between group">
                  <div>
                    <p className="font-semibold text-white/95">{item.description}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-amber-400 font-medium">{formatZar(item.unitPriceZar)}</span> / {item.unit}
                      {item.searchQuery && (
                        <span className="chip chip-neutral text-[9px] lowercase !py-0.5">match: {item.searchQuery}</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="btn-secondary !py-1.5 !px-3 !text-xs !text-red-400 !border-red-500/20 hover:!bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
