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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center page-enter">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <Link href="/" className="btn-primary">
          Back home
        </Link>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="spinner" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl w-full px-5 py-8 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-6 inline-flex">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        All quotes
      </Link>
      <QuoteReview quote={quote} onUpdate={setQuote} />
    </main>
  );
}
