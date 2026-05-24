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
      <main className="p-8 text-center text-zinc-400">Loading…</main>
    );
  }

  if (error === "Not authenticated") {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-zinc-400">Log in to manage your price list.</p>
        <Link href="/login" className="mt-4 inline-block text-amber-500">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link href="/" className="text-sm text-amber-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Your price list</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Items here are used before live supplier lookup when generating quotes.
      </p>

      <form onSubmit={add} className="mt-6 space-y-3 rounded-xl border border-zinc-700 p-4">
        <label className="block text-sm text-zinc-400">
          Description
          <input
            required
            className="mt-1 w-full rounded-lg bg-zinc-900 px-3 py-2 text-white"
            placeholder="Porcelain tile 600x600"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="flex gap-3">
          <label className="flex-1 text-sm text-zinc-400">
            Unit
            <input
              className="mt-1 w-full rounded-lg bg-zinc-900 px-3 py-2 text-white"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </label>
          <label className="flex-1 text-sm text-zinc-400">
            Price (ZAR)
            <input
              type="number"
              required
              step="0.01"
              className="mt-1 w-full rounded-lg bg-zinc-900 px-3 py-2 text-white"
              value={unitPriceZar}
              onChange={(e) => setUnitPriceZar(e.target.value)}
            />
          </label>
        </div>
        <label className="block text-sm text-zinc-400">
          Match keywords (optional)
          <input
            className="mt-1 w-full rounded-lg bg-zinc-900 px-3 py-2 text-white"
            placeholder="tile porcelain 600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-black"
        >
          Add item
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-dashed border-zinc-600 p-4">
        <p className="text-sm text-zinc-400">Import CSV</p>
        <p className="mt-1 text-xs text-zinc-500">
          Columns: description, unit, price, keywords (optional)
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-2 w-full text-sm text-zinc-400"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importCsv(f);
          }}
        />
        {importMsg && (
          <p className="mt-2 text-sm text-green-400">{importMsg}</p>
        )}
      </div>

      {error && error !== "Not authenticated" && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <ul className="mt-8 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-zinc-500">No items yet.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-700 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{item.description}</p>
                <p className="text-sm text-zinc-500">
                  {formatZar(item.unitPriceZar)} / {item.unit}
                  {item.searchQuery && ` · match: ${item.searchQuery}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
