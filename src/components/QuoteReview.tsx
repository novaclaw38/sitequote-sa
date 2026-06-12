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

const CATEGORY_CHIP: Record<string, string> = {
  material: "chip-amber",
  labour: "chip-blue",
  equipment: "chip-purple",
  subcontract: "chip-cyan",
  other: "chip-neutral",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function validUntil(iso: string) {
  const d = new Date(iso);
  d.setDate(d.getDate() + 14);
  return fmtDate(d.toISOString());
}

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

  const deleteLine = (id: string) => {
    onUpdate({ ...quote, lineItems: quote.lineItems.filter((i) => i.id !== id) });
  };

  const addLine = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: "New item",
      category: "other",
      quantity: 1,
      unit: "ea",
      unitPriceZar: 0,
      priceSource: "manual",
    };
    onUpdate({ ...quote, lineItems: [...quote.lineItems, newItem] });
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
      setEmailStatus("Email sent ✓");
    } catch (e) {
      setEmailStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{quote.jobTitle}</h1>
          {quote.aiSummary && (
            <p className="mt-2 text-zinc-400 text-sm max-w-xl leading-relaxed">{quote.aiSummary}</p>
          )}
          {(quote.siteAddress || quote.clientName) && (
            <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
              {quote.clientName && (
                <>
                  <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="font-semibold text-zinc-400">{quote.clientName}</span>
                  {quote.siteAddress && <span className="text-zinc-700">·</span>}
                </>
              )}
              {quote.siteAddress && <span>{quote.siteAddress}</span>}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Created {fmtDate(quote.createdAt)}
            </span>
            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Valid until {validUntil(quote.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start mt-1">
          <span className={`chip ${
            quote.status === "sent" ? "chip-blue" :
            quote.status === "accepted" ? "chip-green" :
            quote.status === "declined" ? "chip-red" :
            "chip-neutral"
          }`}>
            {quote.status}
          </span>
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="btn-secondary !py-1.5 !px-3 !text-xs"
          >
            {saving && <span className="spinner !w-3 !h-3" />}
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
      </header>

      {/* Transcript */}
      {quote.transcript && (
        <details className="glass-static p-4 group">
          <summary className="cursor-pointer text-sm text-zinc-400 font-semibold flex items-center gap-2 select-none">
            <svg className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Site note transcript
          </summary>
          <p className="mt-3 text-sm text-zinc-400 whitespace-pre-wrap bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl leading-relaxed">
            {quote.transcript}
          </p>
        </details>
      )}

      {/* Line items table */}
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
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="min-w-[200px]">
                    <input
                      className="w-full bg-transparent text-white font-medium focus:ring-0 outline-none border-b border-transparent focus:border-amber-500/50 pb-0.5"
                      value={item.description}
                      onChange={(e) => updateLine(item.id, { description: e.target.value })}
                    />
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`chip text-[9px] !py-0.5 !px-1.5 ${CATEGORY_CHIP[item.category] ?? "chip-neutral"}`}>
                        {item.category}
                      </span>
                      {item.supplier?.url && (
                        <a
                          href={item.supplier.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          {item.supplier.supplierName}
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="w-14 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1 text-white text-sm font-semibold focus:outline-none focus:border-amber-500/50"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLine(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <span className="text-xs text-zinc-500 font-medium">{item.unit}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-xs font-semibold">R</span>
                      <input
                        type="number"
                        className="w-24 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1 text-white text-sm font-semibold focus:outline-none focus:border-amber-500/50"
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
                    <span className={`chip text-[9px] !py-0.5 !px-2 ${
                      item.priceSource === "supplier" ? "chip-green" :
                      item.priceSource === "pricelist" ? "chip-amber" :
                      "chip-neutral"
                    }`}>
                      {item.priceSource === "supplier" ? "Live" :
                       item.priceSource === "pricelist" ? "List" :
                       item.priceSource}
                    </span>
                  </td>
                  <td className="text-right font-bold text-white/95 tabular-nums">
                    {formatZar(lineTotal(item, quote.labourRateZar))}
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => deleteLine(item.id)}
                      className="btn-danger !p-1.5"
                      title="Remove item"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="p-3 border-t border-white/[0.04]">
          <button type="button" onClick={addLine} className="btn-add-row">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add line item
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="ml-auto max-w-sm w-full glass-static p-6 space-y-3">
        {totals.materialsSubtotal > 0 && (
          <div className="flex justify-between text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
              Materials
            </span>
            <span>{formatZar(totals.materialsSubtotal)}</span>
          </div>
        )}
        {totals.labourSubtotal > 0 && (
          <div className="flex justify-between text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
              Labour
            </span>
            <span>{formatZar(totals.labourSubtotal)}</span>
          </div>
        )}
        {totals.otherSubtotal > 0 && (
          <div className="flex justify-between text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400/60" />
              Other
            </span>
            <span>{formatZar(totals.otherSubtotal)}</span>
          </div>
        )}
        {(totals.materialsSubtotal > 0 || totals.labourSubtotal > 0 || totals.otherSubtotal > 0) && (
          <div className="divider" />
        )}
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Subtotal</span>
          <span className="text-zinc-300 font-semibold">{formatZar(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Markup ({quote.markupPercent}%)</span>
          <span className="text-zinc-300 font-semibold">{formatZar(totals.markup)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500">
          <span>VAT (15%)</span>
          <span className="text-zinc-300 font-semibold">{formatZar(totals.vat)}</span>
        </div>
        <div className="divider" />
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-sm font-bold text-zinc-300">Total incl. VAT</span>
          <span className="text-2xl font-black text-amber-400 tracking-tight">{formatZar(totals.total)}</span>
        </div>
      </div>

      {/* Share Section */}
      <section className="glass-static p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white">Send to client</h2>
        </div>

        {/* Share link */}
        <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl flex items-center justify-between gap-3 overflow-hidden">
          <code className="text-xs text-zinc-500 truncate select-all">{shareUrl}</code>
          <button
            type="button"
            onClick={copyLink}
            className={`btn-secondary !py-1 !px-2.5 !text-xs whitespace-nowrap shrink-0 ${copied ? "!text-green-400 !border-green-500/20" : ""}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Contact fields */}
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="block flex-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Client WhatsApp</span>
            <input
              className="input mt-2"
              placeholder="e.g. 082 123 4567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </label>
          <label className="block flex-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Client email</span>
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
                disabled={!clientEmail.trim()}
                className="btn-secondary whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </label>
        </div>

        {emailStatus && (
          <p className={`text-xs flex items-center gap-1.5 ${emailStatus.includes("✓") ? "text-green-400" : "text-zinc-400"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${emailStatus.includes("✓") ? "bg-green-400" : "bg-amber-400"}`} />
            {emailStatus}
          </p>
        )}

        <div className="divider" />

        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => save("sent")}
            className="btn-success text-sm font-bold flex-1 sm:flex-initial"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 00-6.98-2.879c-5.443 0-9.87 4.37-9.874 9.8.001 1.748.472 3.454 1.365 4.966l-.993 3.624 3.702-.977zm9.957-6.868c-.27-.136-1.602-.79-1.85-.88-.25-.09-.43-.136-.61.136-.18.27-.7.88-.857 1.063-.157.18-.315.2-.585.065-.27-.136-1.14-.42-2.172-1.34-.803-.717-1.345-1.603-1.502-1.874-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.473.135-.158.18-.27.27-.45.09-.18.045-.338-.02-.473-.068-.136-.61-1.47-.837-2.015-.22-.53-.442-.457-.61-.466-.157-.008-.337-.008-.517-.008-.18 0-.472.067-.72.338-.247.27-.945.923-.945 2.25 0 1.328.967 2.61 1.102 2.79.135.18 1.902 2.904 4.61 4.07 2.707 1.166 2.707.777 3.247.727.54-.05 1.602-.656 1.827-1.293.225-.638.225-1.183.158-1.297-.067-.113-.247-.203-.518-.338z"/>
            </svg>
            Send via WhatsApp
          </a>
          <a
            href={`/q/${quote.shareToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex-1 sm:flex-initial"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Client preview
          </a>
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </a>
        </div>
      </section>

    </div>
  );
}
