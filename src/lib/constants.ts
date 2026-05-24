/** South African building & construction defaults */
export const VAT_RATE = 0.15;
export const CURRENCY = "ZAR" as const;
export const CURRENCY_SYMBOL = "R";

/** Default labour rate (ZAR/hour) — editable per contractor later */
export const DEFAULT_LABOUR_RATE_ZAR = 350;

/** Major SA building suppliers for live price lookup */
export const SA_SUPPLIERS = [
  { id: "builders", name: "Builders Warehouse", domain: "builders.co.za" },
  { id: "cashbuild", name: "Cashbuild", domain: "cashbuild.co.za" },
  { id: "buildit", name: "Build It", domain: "buildit.co.za" },
  { id: "leroy", name: "Leroy Merlin", domain: "leroymerlin.co.za" },
  { id: "buco", name: "BUCO", domain: "bucobrands.co.za" },
  { id: "plumblink", name: "Plumblink", domain: "plumblink.co.za" },
] as const;

export const QUOTE_VALIDITY_DAYS = 14;

export const STANDARD_TERMS = [
  "Prices include VAT at 15% where applicable.",
  "Quote valid for 14 days from issue date.",
  "Final cost subject to on-site verification.",
  "Excludes council fees, engineer sign-off, and unforeseen structural work.",
  "Payment terms: 50% deposit, balance on practical completion unless agreed otherwise.",
];
