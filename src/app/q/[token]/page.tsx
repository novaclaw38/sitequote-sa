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
      <main className="flex min-h-screen items-center justify-center p-8 text-red-400">
        {error}
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="flex min-h-screen items-center justify-center text-zinc-400">
        Loading quotation…
      </main>
    );
  }

  const totals = quoteTotals(quote);
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-amber-500 text-sm font-semibold uppercase">Quotation</p>
      <h1 className="text-2xl font-bold text-white mt-1">{quote.jobTitle}</h1>
      {(quote.clientName || quote.siteAddress) && (
        <p className="mt-2 text-zinc-400">
          {[quote.clientName, quote.siteAddress].filter(Boolean).join(" · ")}
        </p>
      )}
      {quote.aiSummary && (
        <p className="mt-4 text-zinc-300">{quote.aiSummary}</p>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        Valid until {validUntil.toLocaleDateString("en-ZA")}
      </p>

      <table className="mt-8 w-full text-sm">
        <thead className="border-b border-zinc-700 text-left text-zinc-500">
          <tr>
            <th className="pb-2">Item</th>
            <th className="pb-2">Qty</th>
            <th className="pb-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map((item) => (
            <tr key={item.id} className="border-b border-zinc-800">
              <td className="py-3 text-white">{item.description}</td>
              <td className="py-3 text-zinc-400">
                {item.quantity} {item.unit}
              </td>
              <td className="py-3 text-right text-white">
                {formatZar(lineTotal(item, quote.labourRateZar))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span>{formatZar(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Markup</span>
          <span>{formatZar(totals.markup)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>VAT (15%)</span>
          <span>{formatZar(totals.vat)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-amber-400">
          <span>Total incl. VAT</span>
          <span>{formatZar(totals.total)}</span>
        </div>
      </div>

      <QuoteRespond token={token} initialStatus={quote.status} />

      <p className="mt-10 text-xs text-zinc-600 text-center">
        Powered by SiteQuote SA
      </p>
    </main>
  );
}
