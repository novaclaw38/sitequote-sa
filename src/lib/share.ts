import { formatZar, quoteTotals } from "@/lib/quote-schema";
import type { Quote } from "@/lib/quote-schema";

export function getShareUrl(shareToken: string, baseUrl?: string): string {
  const origin =
    baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${origin.replace(/\/$/, "")}/q/${shareToken}`;
}

export function buildWhatsAppUrl(
  quote: Quote & { shareToken: string },
  clientPhone?: string,
  baseUrl?: string,
): string {
  const { total } = quoteTotals(quote);
  const link = getShareUrl(quote.shareToken, baseUrl);
  const text = [
    `Hi${quote.clientName ? ` ${quote.clientName}` : ""},`,
    ``,
    `Please find your quotation for *${quote.jobTitle}*:`,
    `Total (incl. VAT): *${formatZar(total)}*`,
    ``,
    `View full quote: ${link}`,
    ``,
    `Valid 14 days. Reply if you have any questions.`,
  ].join("\n");

  const encoded = encodeURIComponent(text);
  const phone = clientPhone?.replace(/\D/g, "");
  if (phone) {
    const withCountry = phone.startsWith("27") ? phone : `27${phone.replace(/^0/, "")}`;
    return `https://wa.me/${withCountry}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
