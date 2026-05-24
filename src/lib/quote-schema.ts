import { z } from "zod";

export const supplierPriceSchema = z.object({
  supplierId: z.string(),
  supplierName: z.string(),
  productName: z.string().optional(),
  unitPriceZar: z.number(),
  url: z.string().url().optional(),
  fetchedAt: z.string().datetime().optional(),
});

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.enum([
    "material",
    "labour",
    "equipment",
    "subcontract",
    "other",
  ]),
  quantity: z.number().positive(),
  unit: z.string(),
  unitPriceZar: z.number().nonnegative(),
  laborHours: z.number().nonnegative().optional(),
  supplier: supplierPriceSchema.optional(),
  notes: z.string().optional(),
  priceSource: z
    .enum(["supplier", "estimate", "manual", "pricelist"])
    .default("estimate"),
});

export const quoteSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  status: z.enum(["draft", "sent", "accepted", "declined"]),
  jobTitle: z.string(),
  clientName: z.string().optional(),
  siteAddress: z.string().optional(),
  transcript: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["audio", "video"]).optional(),
  lineItems: z.array(lineItemSchema),
  labourRateZar: z.number().positive(),
  markupPercent: z.number().nonnegative().default(15),
  vatIncluded: z.boolean().default(true),
  notes: z.string().optional(),
  aiSummary: z.string().optional(),
});

export type Quote = z.infer<typeof quoteSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type SupplierPrice = z.infer<typeof supplierPriceSchema>;

export const extractedScopeSchema = z.object({
  jobTitle: z.string(),
  siteAddress: z.string().optional(),
  clientName: z.string().optional(),
  summary: z.string(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      category: lineItemSchema.shape.category,
      quantity: z.number().positive(),
      unit: z.string(),
      estimatedLaborHours: z.number().nonnegative().optional(),
      searchQuery: z.string().optional(),
    }),
  ),
  assumptions: z.array(z.string()).optional(),
});

export type ExtractedScope = z.infer<typeof extractedScopeSchema>;

export function formatZar(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function lineTotal(item: LineItem, labourRateZar: number): number {
  if (item.category === "labour") {
    const hours = item.laborHours ?? item.quantity;
    return hours * item.unitPriceZar;
  }
  return item.quantity * item.unitPriceZar;
}

export function quoteTotals(
  quote: Quote,
): {
  materialsSubtotal: number;
  labourSubtotal: number;
  otherSubtotal: number;
  subtotal: number;
  markup: number;
  vat: number;
  total: number;
} {
  let materialsSubtotal = 0;
  let labourSubtotal = 0;
  let otherSubtotal = 0;

  for (const item of quote.lineItems) {
    const total = lineTotal(item, quote.labourRateZar);
    if (item.category === "material") materialsSubtotal += total;
    else if (item.category === "labour") labourSubtotal += total;
    else otherSubtotal += total;
  }

  const subtotal = materialsSubtotal + labourSubtotal + otherSubtotal;
  const markup = subtotal * (quote.markupPercent / 100);
  const beforeVat = subtotal + markup;
  const vat = quote.vatIncluded ? beforeVat * 0.15 : 0;
  const total = beforeVat + vat;

  return {
    materialsSubtotal,
    labourSubtotal,
    otherSubtotal,
    subtotal,
    markup,
    vat,
    total,
  };
}
