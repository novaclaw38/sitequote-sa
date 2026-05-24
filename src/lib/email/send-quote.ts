import { formatZar, quoteTotals } from "@/lib/quote-schema";
import type { Quote } from "@/lib/quote-schema";
import { getShareUrl } from "@/lib/share";

export async function sendQuoteEmail(input: {
  to: string;
  quote: Quote & { shareToken: string };
  companyName?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it in Vercel environment variables.",
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "SiteQuote <onboarding@resend.dev>";
  const { total } = quoteTotals(input.quote);
  const link = getShareUrl(input.quote.shareToken);
  const company = input.companyName ?? "Your contractor";

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #111;">
      <h1 style="font-size: 20px;">Quotation: ${escapeHtml(input.quote.jobTitle)}</h1>
      <p>Hi${input.quote.clientName ? ` ${escapeHtml(input.quote.clientName)}` : ""},</p>
      <p>${escapeHtml(company)} has sent you a quotation for your project.</p>
      ${input.quote.aiSummary ? `<p>${escapeHtml(input.quote.aiSummary)}</p>` : ""}
      <p style="font-size: 18px;"><strong>Total (incl. VAT): ${formatZar(total)}</strong></p>
      <p><a href="${link}" style="display:inline-block;background:#f59e0b;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View full quote</a></p>
      <p style="font-size: 12px; color: #666;">Valid 14 days. Prices subject to on-site verification.</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Quotation: ${input.quote.jobTitle}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Email failed: ${err}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
