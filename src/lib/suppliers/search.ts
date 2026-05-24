import { SA_SUPPLIERS } from "@/lib/constants";
import type { SupplierPrice } from "@/lib/quote-schema";

export type SupplierSearchResult = {
  query: string;
  bestMatch: SupplierPrice | null;
  alternatives: SupplierPrice[];
};

type SerperOrganic = {
  title?: string;
  link?: string;
  snippet?: string;
};

/** Parse ZAR prices from search snippets (R 123, R123.45, R 1 234) */
export function parseZarFromText(text: string): number | null {
  const patterns = [
    /R\s?([\d\s]+(?:[.,]\d{2})?)/gi,
    /ZAR\s?([\d\s]+(?:[.,]\d{2})?)/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const m of matches) {
      const raw = m[1].replace(/\s/g, "").replace(",", ".");
      const value = parseFloat(raw);
      if (!Number.isNaN(value) && value > 0 && value < 10_000_000) {
        return value;
      }
    }
  }
  return null;
}

async function serperSearch(
  query: string,
  site?: string,
): Promise<SerperOrganic[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  const q = site ? `${query} site:${site}` : `${query} price South Africa`;

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q, gl: "za", hl: "en", num: 8 }),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { organic?: SerperOrganic[] };
  return data.organic ?? [];
}

function resultToPrice(
  supplierId: string,
  supplierName: string,
  item: SerperOrganic,
): SupplierPrice | null {
  const blob = `${item.title ?? ""} ${item.snippet ?? ""}`;
  const unitPriceZar = parseZarFromText(blob);
  if (unitPriceZar == null) return null;

  return {
    supplierId,
    supplierName,
    productName: item.title,
    unitPriceZar,
    url: item.link,
    fetchedAt: new Date().toISOString(),
  };
}

/** Search SA building suppliers for live unit pricing */
export async function searchSupplierPrices(
  searchQuery: string,
): Promise<SupplierSearchResult> {
  const query = searchQuery.trim();
  const alternatives: SupplierPrice[] = [];

  for (const supplier of SA_SUPPLIERS) {
    const organic = await serperSearch(
      `${query} ${supplier.name}`,
      supplier.domain,
    );

    for (const row of organic.slice(0, 2)) {
      const price = resultToPrice(supplier.id, supplier.name, row);
      if (price) alternatives.push(price);
    }
  }

  // Broader SA retail search if supplier-specific results are thin
  if (alternatives.length < 2) {
    const broad = await serperSearch(`${query} buy price`);
    for (const row of broad.slice(0, 5)) {
      const domain = row.link ? new URL(row.link).hostname : "";
      const match = SA_SUPPLIERS.find((s) => domain.includes(s.domain));
      const price = resultToPrice(
        match?.id ?? "web",
        match?.name ?? "Web",
        row,
      );
      if (price) alternatives.push(price);
    }
  }

  alternatives.sort((a, b) => a.unitPriceZar - b.unitPriceZar);

  const bestMatch = alternatives[0] ?? null;

  return { query, bestMatch, alternatives: alternatives.slice(0, 5) };
}

export function hasSupplierSearch(): boolean {
  return Boolean(process.env.SERPER_API_KEY);
}
