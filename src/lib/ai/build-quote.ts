import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_LABOUR_RATE_ZAR,
} from "@/lib/constants";
import { extractScopeFromTranscript } from "@/lib/ai/extract-scope";
import {
  hasSupplierSearch,
  searchSupplierPrices,
} from "@/lib/suppliers/search";
import { findPriceListMatch } from "@/lib/price-list";
import type { ExtractedScope, LineItem, Quote } from "@/lib/quote-schema";

type BuildQuoteInput = {
  transcript: string;
  mediaUrl?: string;
  mediaType?: "audio" | "video";
  labourRateZar?: number;
  markupPercent?: number;
  contractorId?: string | null;
};

type ScopeBuildInput = {
  scope: ExtractedScope;
  transcript?: string;
  mediaUrl?: string;
  mediaType?: "audio" | "video";
  labourRateZar?: number;
  markupPercent?: number;
  contractorId?: string | null;
};

/**
 * Turn a structured scope into a priced quote.
 * Pricing priority per material line: contractor price list → live supplier
 * search → baseline estimate. Shared by the voice/transcript path and the
 * job-template path.
 */
export async function buildQuoteFromScope(
  input: ScopeBuildInput,
): Promise<Quote> {
  const { scope } = input;
  const labourRateZar = input.labourRateZar ?? DEFAULT_LABOUR_RATE_ZAR;
  const lineItems: LineItem[] = [];

  for (const row of scope.lineItems) {
    const id = uuidv4();

    if (row.category === "labour") {
      const hours = row.estimatedLaborHours ?? row.quantity;
      lineItems.push({
        id,
        description: row.description,
        category: "labour",
        quantity: hours,
        unit: "hours",
        unitPriceZar: labourRateZar,
        laborHours: hours,
        priceSource: "estimate",
        notes: "Labour at default contractor rate",
      });
      continue;
    }

    let unitPriceZar = 0;
    let supplier: LineItem["supplier"];
    let priceSource: LineItem["priceSource"] = "estimate";
    let notes: string | undefined;

    const lookupQuery = row.searchQuery ?? row.description;
    if (input.contractorId) {
      const listed = await findPriceListMatch(
        input.contractorId,
        lookupQuery,
      );
      if (listed) {
        unitPriceZar = listed.unitPriceZar;
        priceSource = "pricelist";
        notes = "Your price list";
      }
    }

    if (unitPriceZar === 0 && row.searchQuery && hasSupplierSearch()) {
      const search = await searchSupplierPrices(row.searchQuery);
      if (search.bestMatch) {
        unitPriceZar = search.bestMatch.unitPriceZar;
        supplier = search.bestMatch;
        priceSource = "supplier";
      }
    }

    if (unitPriceZar === 0) {
      unitPriceZar = estimateFallbackPrice(row.description, row.unit);
      priceSource = "estimate";
    }

    lineItems.push({
      id,
      description: row.description,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      unitPriceZar,
      laborHours: row.estimatedLaborHours,
      supplier,
      priceSource,
      notes:
        notes ??
        (priceSource === "estimate"
          ? "Estimated — verify against supplier or your price list"
          : undefined),
    });
  }

  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: "draft",
    jobTitle: scope.jobTitle,
    clientName: scope.clientName,
    siteAddress: scope.siteAddress,
    transcript: input.transcript,
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    lineItems,
    labourRateZar,
    markupPercent: input.markupPercent ?? 15,
    vatIncluded: true,
    notes: scope.assumptions?.join("\n"),
    aiSummary: scope.summary,
  };
}

export async function buildQuoteFromTranscript(
  input: BuildQuoteInput,
): Promise<Quote> {
  const scope = await extractScopeFromTranscript(input.transcript);
  return buildQuoteFromScope({
    scope,
    transcript: input.transcript,
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    labourRateZar: input.labourRateZar,
    markupPercent: input.markupPercent,
    contractorId: input.contractorId,
  });
}

/** Rough ZAR fallback when supplier API unavailable */
function estimateFallbackPrice(description: string, unit: string): number {
  const d = description.toLowerCase();
  if (d.includes("cement") || d.includes("ppc")) return unit === "bag" ? 95 : 95;
  if (d.includes("brick")) return 3.5;
  if (d.includes("paint")) return 450;
  if (d.includes("tile")) return 120;
  if (d.includes("ibr") || d.includes("roof")) return 180;
  if (d.includes("door")) return 2500;
  if (d.includes("window")) return 1800;
  if (unit === "m²") return 250;
  if (unit === "m") return 85;
  return 150;
}
