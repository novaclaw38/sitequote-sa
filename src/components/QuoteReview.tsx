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
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{quote.jobTitle}</h1>
          {quote.aiSummary && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{quote.aiSummary}</p>
          )}
          {(quote.siteAddress || quote.clientName) && (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              {quote.clientName && (
                <>
                  <span className="font-medium text-slate-400">{quote.clientName}</span>
                  {quote.siteAddress && <span className="text-slate-700">•</span>}
                </>
              )}
              {quote.siteAddress && <span>{quote.siteAddress}</span>}
            </p>
          )}
        </div>
        <span className={`self-start chip ${
          quote.status === "sent" ? "chip-blue" :
          quote.status === "accepted" ? "chip-green" :
          "chip-neutral"
        }`}>
          {quote.status}
        </span>
      </header>

      {/* Transcript */}
      {quote.transcript && (
        <details className="glass-static group p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400">
            <svg className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            Site note transcript
          </summary>
          <p className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-400">
            {quote.transcript}
          </p>
        </details>
      )}

      {/* Table */}
      <div className="glass-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Source</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="min-w-[200px]">
                    <input
                      className="w-full border-b border-transparent bg-transparent pb-0.5 font-medium text-white outline-none transition-colors duration-200 ease-in-out focus:border-emerald-500 focus:ring-0"
                      value={item.description}
                      onChange={(e) =>
                        updateLine(item.id, { description: e.target.value })
                      }
                    />
                    {item.supplier?.url && (
                      <div className="mt-1 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        <a
                          href={item.supplier.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[180px] truncate text-xs text-emerald-400 transition-colors hover:text-emerald-300 hover:underline"
                        >
                          {item.supplier.supplierName}
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="num w-14 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-sm text-white outline-none transition-all duration-200 ease-in-out focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLine(item.id, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="text-xs font-medium text-slate-500">{item.unit}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">R</span>
                      <input
                        type="number"
                        className="num w-20 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-sm text-white outline-none transition-all duration-200 ease-in-out focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                        value={item.unitPriceZar}
                        onChange={(e) =>
                          updateLine(item.id, {
                            unitPriceZar: parseFloat(e.target.value) || 0,
                            priceSource: "manual",
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <span
                      className={`chip text-[10px] !py-0.5 !px-2 ${
                        item.priceSource === "supplier" ? "chip-green" :
                        item.priceSource === "pricelist" ? "chip-amber" :
                        "chip-neutral"
                      }`}
                    >
                      {item.priceSource === "supplier" ? "Live supplier" :
                       item.priceSource === "pricelist" ? "Your list" :
                       item.priceSource}
                    </span>
                  </td>
                  <td className="num text-right text-white">
                    {formatZar(lineTotal(item, quote.labourRateZar))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="glass-static ml-auto max-w-sm space-y-3 p-6">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span className="num text-slate-300">{formatZar(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Markup ({quote.markupPercent}%)</span>
          <span className="num text-slate-300">{formatZar(totals.markup)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>VAT (15%)</span>
          <span className="num text-slate-300">{formatZar(totals.vat)}</span>
        </div>
        <div className="divider" />
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-semibold text-slate-300">Total incl. VAT</span>
          <span className="num text-2xl font-semibold tracking-tight text-emerald-400">{formatZar(totals.total)}</span>
        </div>
      </div>

      {/* Share Section */}
      <section className="glass-static space-y-4 p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
          <h2 className="text-base font-semibold tracking-tight text-white">Send to client</h2>
        </div>

        <div className="flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-3">
          <code className="select-all truncate font-mono text-xs text-slate-500">{shareUrl}</code>
          <button
            type="button"
            onClick={copyLink}
            className="btn-secondary !py-1 !px-2.5 !text-xs whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="block flex-1">
            <span className="text-xs font-medium text-slate-400">Client WhatsApp</span>
            <input
              className="input mt-2"
              placeholder="e.g. 082 123 4567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </label>
          <label className="block flex-1">
            <span className="text-xs font-medium text-slate-400">Client email</span>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                className="input flex-1"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={sendEmail}
                className="btn-secondary whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </label>
        </div>

        {emailStatus && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{emailStatus}</span>
          </div>
        )}

        <div className="divider" />

        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => save("sent")}
            className="btn-success flex-1 text-sm sm:flex-initial"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 00-6.98-2.879c-5.443 0-9.87 4.37-9.874 9.8.001 1.748.472 3.454 1.365 4.966l-.993 3.624 3.702-.977zm9.957-6.868c-.27-.136-1.602-.79-1.85-.88-.25-.09-.43-.136-.61.136-.18.27-.7.88-.857 1.063-.157.18-.315.2-.585.065-.27-.136-1.14-.42-2.172-1.34-.803-.717-1.345-1.603-1.502-1.874-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.473.135-.158.18-.27.27-.45.09-.18.045-.338-.02-.473-.068-.136-.61-1.47-.837-2.015-.22-.53-.442-.457-.61-.466-.157-.008-.337-.008-.517-.008-.18 0-.472.067-.72.338-.247.27-.945.923-.945 2.25 0 1.328.967 2.61 1.102 2.79.135.18 1.902 2.904 4.61 4.07 2.707 1.166 2.707.777 3.247.727.54-.05 1.602-.656 1.827-1.293.225-.638.225-1.183.158-1.297-.067-.113-.247-.203-.518-.338z"/></svg>
            WhatsApp quote
          </a>
          <a
            href={`/q/${quote.shareToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex-1 sm:flex-initial"
          >
            Preview client view
          </a>
        </div>
      </section>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => save()}
          disabled={saving}
          className="btn-secondary"
        >
          {saving && <span className="spinner mr-1.5" />}
          {saving ? "Saving…" : "Save draft"}
        </button>
        <a
          href={`/api/quotes/${quote.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Export PDF
        </a>
      </div>
    </div>
  );
}
