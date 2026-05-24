"use client";

import { useState } from "react";
import type { LineItem } from "@/lib/quote-schema";
import { formatZar, lineTotal, quoteTotals } from "@/lib/quote-schema";
import type { StoredQuote } from "@/lib/store";
import { buildWhatsAppUrl, getShareUrl } from "@/lib/share";

type Props = {
  quote: StoredQuote;
  onUpdate: (quote: StoredQuote) => void;
};

export function QuoteReview({ quote, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const totals = quoteTotals(quote);
  const shareUrl =
    typeof window !== "undefined"
      ? getShareUrl(quote.shareToken, window.location.origin)
      : getShareUrl(quote.shareToken);

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    const lineItems = quote.lineItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    onUpdate({ ...quote, lineItems });
  };

  const save = async (status?: StoredQuote["status"]) => {
    setSaving(true);
    try {
      const payload = status ? { ...quote, status } : quote;
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.quote) onUpdate(data.quote);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = buildWhatsAppUrl(quote, clientPhone || undefined);

  const sendEmail = async () => {
    if (!clientEmail.trim()) return;
    setEmailStatus("Sending…");
    try {
      const res = await fetch(`/api/quotes/${quote.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: clientEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      if (data.quote) onUpdate(data.quote);
      setEmailStatus("Email sent");
    } catch (e) {
      setEmailStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">{quote.jobTitle}</h1>
        {quote.aiSummary && (
          <p className="mt-2 text-zinc-400">{quote.aiSummary}</p>
        )}
        {(quote.siteAddress || quote.clientName) && (
          <p className="mt-1 text-sm text-zinc-500">
            {[quote.clientName, quote.siteAddress].filter(Boolean).join(" · ")}
          </p>
        )}
        <span
          className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${
            quote.status === "sent"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {quote.status}
        </span>
      </header>

      {quote.transcript && (
        <details className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4">
          <summary className="cursor-pointer text-sm text-zinc-400">
            Site transcript
          </summary>
          <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">
            {quote.transcript}
          </p>
        </details>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-left text-zinc-400">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit price</th>
              <th className="p-3">Source</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item) => (
              <tr key={item.id} className="border-t border-zinc-700/80">
                <td className="p-3">
                  <input
                    className="w-full min-w-[140px] bg-transparent text-white"
                    value={item.description}
                    onChange={(e) =>
                      updateLine(item.id, { description: e.target.value })
                    }
                  />
                  {item.supplier?.url && (
                    <a
                      href={item.supplier.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-500 hover:underline"
                    >
                      {item.supplier.supplierName}
                    </a>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      className="w-16 rounded bg-zinc-800 px-2 py-1 text-white"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLine(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="text-zinc-500">{item.unit}</span>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    className="w-24 rounded bg-zinc-800 px-2 py-1 text-white"
                    value={item.unitPriceZar}
                    onChange={(e) =>
                      updateLine(item.id, {
                        unitPriceZar: parseFloat(e.target.value) || 0,
                        priceSource: "manual",
                      })
                    }
                  />
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      item.priceSource === "supplier"
                        ? "bg-green-900/50 text-green-300"
                        : item.priceSource === "pricelist"
                          ? "bg-amber-900/50 text-amber-300"
                          : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {item.priceSource === "supplier"
                      ? "Live supplier"
                      : item.priceSource === "pricelist"
                        ? "Your list"
                        : item.priceSource}
                  </span>
                </td>
                <td className="p-3 text-right text-white">
                  {formatZar(lineTotal(item, quote.labourRateZar))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span>{formatZar(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Markup ({quote.markupPercent}%)</span>
          <span>{formatZar(totals.markup)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>VAT (15%)</span>
          <span>{formatZar(totals.vat)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-amber-400">
          <span>Total incl. VAT</span>
          <span>{formatZar(totals.total)}</span>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Send to client</h2>
        <p className="text-xs text-zinc-500 break-all">{shareUrl}</p>
        <label className="block text-xs text-zinc-500">
          Client WhatsApp (optional, e.g. 0821234567)
          <input
            className="mt-1 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white"
            placeholder="082 123 4567"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Client email
          <div className="mt-1 flex gap-2">
            <input
              type="email"
              className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={sendEmail}
              className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600"
            >
              Send
            </button>
          </div>
          {emailStatus && (
            <p className="mt-1 text-xs text-zinc-400">{emailStatus}</p>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => save("sent")}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
          >
            Send via WhatsApp
          </a>
          <a
            href={`/q/${quote.shareToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300"
          >
            Preview client view
          </a>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save()}
          disabled={saving}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Export PDF
        </a>
      </div>
    </div>
  );
}
