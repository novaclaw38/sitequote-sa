import { NextResponse } from "next/server";
import { getQuote } from "@/lib/store";
import {
  formatZar,
  lineTotal,
  quoteTotals,
} from "@/lib/quote-schema";
import { QUOTE_VALIDITY_DAYS, STANDARD_TERMS } from "@/lib/constants";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const session = await getSession();
  if (quote.contractorId) {
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (session.contractorId !== quote.contractorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const totals = quoteTotals(quote);
  const issued = new Date(quote.createdAt).toLocaleDateString("en-ZA");
  const validUntil = new Date(quote.createdAt);
  validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

  const rows = quote.lineItems
    .map((item) => {
      const total = lineTotal(item, quote.labourRateZar);
      const source =
        item.priceSource === "supplier"
          ? item.supplier?.supplierName ?? "Supplier"
          : "Estimate";
      return `<tr>
        <td>${escapeHtml(item.description)}</td>
        <td>${item.quantity} ${escapeHtml(item.unit)}</td>
        <td>${formatZar(item.unitPriceZar)}</td>
        <td>${escapeHtml(source)}</td>
        <td>${formatZar(total)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8" />
  <title>Quote — ${escapeHtml(quote.jobTitle)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; color: #111; }
    h1 { font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    .totals { margin-left: auto; width: 280px; }
    .totals td:last-child { text-align: right; }
    .terms { font-size: 0.85rem; color: #444; margin-top: 2rem; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  <h1>Quotation</h1>
  <p><strong>Job:</strong> ${escapeHtml(quote.jobTitle)}</p>
  ${quote.clientName ? `<p><strong>Client:</strong> ${escapeHtml(quote.clientName)}</p>` : ""}
  ${quote.siteAddress ? `<p><strong>Site:</strong> ${escapeHtml(quote.siteAddress)}</p>` : ""}
  <p><strong>Date:</strong> ${issued} &nbsp;|&nbsp; <strong>Valid until:</strong> ${validUntil.toLocaleDateString("en-ZA")}</p>
  ${quote.aiSummary ? `<p>${escapeHtml(quote.aiSummary)}</p>` : ""}

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit price</th>
        <th>Source</th>
        <th>Line total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td>${formatZar(totals.subtotal)}</td></tr>
    <tr><td>Markup (${quote.markupPercent}%)</td><td>${formatZar(totals.markup)}</td></tr>
    <tr><td>VAT (15%)</td><td>${formatZar(totals.vat)}</td></tr>
    <tr><td><strong>Total incl. VAT</strong></td><td><strong>${formatZar(totals.total)}</strong></td></tr>
  </table>

  <div class="terms">
    <p><strong>Terms &amp; conditions</strong></p>
    <ul>${STANDARD_TERMS.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    ${quote.notes ? `<p><strong>Notes:</strong> ${escapeHtml(quote.notes)}</p>` : ""}
  </div>
  <script>window.onload = () => window.print()</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
