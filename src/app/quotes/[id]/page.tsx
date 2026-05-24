"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QuoteReview } from "@/components/QuoteReview";
import type { StoredQuote } from "@/lib/store";

export default function QuotePage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.quote) setQuote(data.quote);
        else setError(data.error ?? "Not found");
      })
      .catch(() => setError("Failed to load quote"));
  }, [id]);

  if (error) {
    return (
      <main className="p-8 text-center text-red-400">
        {error}
        <Link href="/" className="mt-4 block text-amber-500">
          Home
        </Link>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-400">
        Loading quote…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="mb-4 inline-block text-sm text-amber-500 hover:underline">
        ← All quotes
      </Link>
      <QuoteReview quote={quote} onUpdate={setQuote} />
    </main>
  );
}
