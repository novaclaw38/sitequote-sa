"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  formatZar,
  lineTotal,
  quoteTotals,
  type Quote,
} from "@/lib/quote-schema";
import { QUOTE_VALIDITY_DAYS } from "@/lib/constants";
import { QuoteRespond } from "@/components/QuoteRespond";

type PublicQuote = Quote & { shareToken: string };

export default function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/quotes/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.quote) setQuote(d.quote);
        else setError(d.error ?? "Quote not found");
      });
  }, [token]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center page-enter">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
        <p className="text-red-400 font-semibold mb-4">{error}</p>
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

  const totals = quoteTotals(quote);
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

  return (
    <main className="mx-auto max-w-2xl w-full px-5 py-12 page-enter">
      <div className="glass-static p-8 sm:p-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="chip chip-amber mb-3">Quotation</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{quote.jobTitle}</h1>
            {(quote.clientName || quote.siteAddress) && (
              <p className="mt-2 text-zinc-400 text-sm flex flex-wrap items-center gap-1.5 leading-relaxed">
                {quote.clientName && <span className="font-semibold text-zinc-300">{quote.clientName}</span>}
                {quote.clientName && quote.siteAddress && <span className="text-zinc-700">•</span>}
                {quote.siteAddress && <span>{quote.siteAddress}</span>}
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest block">Valid until</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block">
              {validUntil.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </header>

        {quote.aiSummary && (
          <div className="bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Job description</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{quote.aiSummary}</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden border border-white/[0.05] rounded-xl">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-white/95">{item.description}</td>
                  <td className="text-zinc-400 text-xs font-medium">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="text-right font-semibold text-white/95">
                    {formatZar(lineTotal(item, quote.labourRateZar))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-3 pt-2">
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Subtotal</span>
            <span className="text-zinc-300 font-medium">{formatZar(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-500">
            <span>VAT (15%)</span>
            <span className="text-zinc-300 font-medium">{formatZar(totals.vat)}</span>
          </div>
          <div className="divider" />
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-semibold text-zinc-300">Total incl. VAT</span>
            <span className="text-2xl font-black text-amber-400 tracking-tight">{formatZar(totals.total)}</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="divider" />
        <QuoteRespond token={token} initialStatus={quote.status} />
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[10px] text-zinc-600 font-medium tracking-wide">
          Powered by SiteQuote SA · Accurate & Fast Quantity Surveying
        </p>
      </footer>
    </main>
  );
}
