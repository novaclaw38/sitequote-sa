import type { ExtractedScope } from "@/lib/quote-schema";

/**
 * Job templates — the deterministic spine of SiteQuote.
 *
 * A contractor picks a common SA building job, enters one or two key
 * measurements, and we expand it into a full material + labour scope using
 * standard rules of thumb. That scope is then priced through the normal
 * pipeline (their price list → live supplier → baseline estimate), so the
 * numbers stay trustworthy and editable rather than AI-invented.
 */

export type TemplateInput = {
  key: string;
  label: string;
  unit: string;
  default: number;
  min?: number;
  step?: number;
  hint?: string;
};

type ScopeLine = ExtractedScope["lineItems"][number];

export type TemplateScope = {
  jobTitle: string;
  summary: string;
  assumptions: string[];
  lineItems: ScopeLine[];
};

export type JobTemplate = {
  id: string;
  name: string;
  blurb: string;
  /** Heroicon-style SVG path data */
  icon: string;
  inputs: TemplateInput[];
  build: (values: Record<string, number>) => TemplateScope;
};

const ceil = (n: number) => Math.max(1, Math.ceil(n));
const round1 = (n: number) => Math.round(n * 10) / 10;

const mat = (
  description: string,
  quantity: number,
  unit: string,
  searchQuery: string,
): ScopeLine => ({
  description,
  category: "material",
  quantity,
  unit,
  searchQuery,
});

const labour = (description: string, hours: number): ScopeLine => ({
  description,
  category: "labour",
  quantity: hours,
  unit: "hours",
  estimatedLaborHours: hours,
});

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: "floor-tiling",
    name: "Floor tiling",
    blurb: "Tiles, adhesive, grout and labour for a tiled floor.",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM12 3.75v16.5M3.75 12h16.5",
    inputs: [
      { key: "area", label: "Floor area", unit: "m²", default: 10, min: 1, step: 0.5 },
    ],
    build: ({ area }) => ({
      jobTitle: `Floor tiling — ${area} m²`,
      summary: `Supply and lay porcelain floor tiles over ${area} m², including adhesive, grout and finishing.`,
      assumptions: [
        "10% waste allowance on tiles included.",
        "Assumes a sound, level screed — no extra surface prep priced.",
      ],
      lineItems: [
        mat("Porcelain floor tiles 600×600", ceil(area * 1.1), "m²", "porcelain floor tile 600x600"),
        mat("Tile adhesive 20kg", ceil(area / 4), "bag", "tile adhesive 20kg"),
        mat("Tile grout 5kg", ceil(area / 10), "bag", "tile grout 5kg"),
        mat("Tile spacers 3mm", 1, "pack", "tile spacers 3mm"),
        labour("Tiling labour", ceil(area * 0.7)),
      ],
    }),
  },
  {
    id: "plaster-paint",
    name: "Plaster & paint",
    blurb: "Interior wall plastering and two-coat PVA paint.",
    icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
    inputs: [
      { key: "area", label: "Wall area", unit: "m²", default: 40, min: 1, step: 1 },
    ],
    build: ({ area }) => ({
      jobTitle: `Plaster & paint — ${area} m²`,
      summary: `Plaster and apply one undercoat plus two coats of interior PVA over ${area} m² of wall.`,
      assumptions: [
        "Two finish coats over one undercoat assumed.",
        "Existing walls in fair condition — major crack repair excluded.",
      ],
      lineItems: [
        mat("Plaster sand", round1(area * 0.02), "m³", "plaster sand"),
        mat("Cement PPC 42.5N 50kg", ceil(area * 0.1), "bag", "ppc cement 50kg"),
        mat("Universal undercoat 20L", ceil(area / 140), "tub", "universal undercoat 20l"),
        mat("Interior PVA paint 20L", ceil((area * 2) / 140), "tub", "interior pva paint 20l"),
        labour("Plastering & painting labour", ceil(area * 0.5)),
      ],
    }),
  },
  {
    id: "boundary-wall",
    name: "Boundary wall",
    blurb: "Single-skin plastered brick boundary wall.",
    icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
    inputs: [
      { key: "length", label: "Wall length", unit: "m", default: 20, min: 1, step: 0.5 },
      { key: "height", label: "Wall height", unit: "m", default: 1.8, min: 0.5, step: 0.1 },
    ],
    build: ({ length, height }) => {
      const area = length * height;
      return {
        jobTitle: `Boundary wall — ${length}m × ${height}m`,
        summary: `Build a single-skin plastered clay-brick boundary wall, ${length} m long and ${height} m high (${round1(area)} m²).`,
        assumptions: [
          "Single-skin (half-brick) wall, both sides plastered.",
          "Excludes foundations, gates and engineer sign-off.",
        ],
        lineItems: [
          mat("Clay stock bricks", ceil(area * 55), "each", "clay stock brick"),
          mat("Cement PPC 42.5N 50kg", ceil(area * 0.5), "bag", "ppc cement 50kg"),
          mat("Building sand", round1(area * 0.03), "m³", "building sand"),
          mat("Brickforce 75mm", ceil(length / 20), "roll", "brickforce 75mm"),
          labour("Bricklaying & plastering labour", ceil(area * 1.2)),
        ],
      };
    },
  },
  {
    id: "ibr-roof",
    name: "IBR roof sheeting",
    blurb: "IBR sheeting, purlins and fixings for a roof.",
    icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
    inputs: [
      { key: "area", label: "Roof area", unit: "m²", default: 60, min: 1, step: 1 },
    ],
    build: ({ area }) => ({
      jobTitle: `IBR roof — ${area} m²`,
      summary: `Supply and install 0.47mm IBR roof sheeting over ${area} m², including purlins, ridging and fixings.`,
      assumptions: [
        "10% overlap/waste allowance on sheeting.",
        "Assumes existing trusses in place — carpentry excluded.",
      ],
      lineItems: [
        mat("IBR sheeting 0.47mm galvanised", ceil(area * 1.1), "m²", "ibr roof sheeting 0.47mm"),
        mat("Lipped channel purlins 76×50", ceil(area), "m", "lipped channel purlin 76x50"),
        mat("Ridging galvanised", ceil(area / 6), "m", "galvanised roof ridging"),
        mat("Roof tek screws", ceil(area * 8), "each", "roofing tek screws"),
        labour("Roofing labour", ceil(area * 0.4)),
      ],
    }),
  },
  {
    id: "concrete-slab",
    name: "Concrete slab",
    blurb: "Reinforced ready-mix slab with mesh and DPC.",
    icon: "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z",
    inputs: [
      { key: "area", label: "Slab area", unit: "m²", default: 12, min: 1, step: 0.5 },
      { key: "thickness", label: "Thickness", unit: "mm", default: 100, min: 50, step: 10 },
    ],
    build: ({ area, thickness }) => {
      const volume = area * (thickness / 1000);
      return {
        jobTitle: `Concrete slab — ${area} m² @ ${thickness}mm`,
        summary: `Cast a ${thickness}mm reinforced concrete slab over ${area} m² (${round1(volume)} m³), including mesh and damp-proof membrane.`,
        assumptions: [
          "25 MPa ready-mix with 5% over-order allowance.",
          "Excludes excavation, formwork hire and power floating.",
        ],
        lineItems: [
          mat("Ready-mix concrete 25MPa", round1(volume * 1.05), "m³", "ready mix concrete 25mpa"),
          mat("Reinforcing mesh Ref 193", ceil(area / 13), "sheet", "reinforcing mesh ref 193"),
          mat("DPC plastic sheeting 250µm", ceil(area * 1.1), "m²", "dpc plastic sheeting 250 micron"),
          labour("Concrete & finishing labour", ceil(area * 1.5)),
        ],
      };
    },
  },
  {
    id: "bathroom-reno",
    name: "Bathroom renovation",
    blurb: "Strip-out, tiling and re-fit of a bathroom.",
    icon: "M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m0 0V6.75A2.25 2.25 0 015.25 4.5h.75m12 0h.75A2.25 2.25 0 0121 6.75V9M6 4.5a1.5 1.5 0 113 0v.75H6V4.5z",
    inputs: [
      { key: "floor", label: "Floor area", unit: "m²", default: 5, min: 1, step: 0.5 },
      { key: "walls", label: "Wall tile area", unit: "m²", default: 18, min: 1, step: 1 },
    ],
    build: ({ floor, walls }) => {
      const tiled = floor + walls;
      return {
        jobTitle: `Bathroom renovation — ${floor} m² floor`,
        summary: `Strip out and refit a bathroom: tile ${floor} m² floor and ${walls} m² of walls, and install a new toilet, basin and shower mixer.`,
        assumptions: [
          "Sanitaryware is mid-range; client may select own fittings.",
          "Assumes existing plumbing points reused where possible.",
        ],
        lineItems: [
          mat("Ceramic wall tiles", ceil(walls * 1.1), "m²", "ceramic wall tile"),
          mat("Porcelain floor tiles", ceil(floor * 1.1), "m²", "porcelain floor tile"),
          mat("Tile adhesive 20kg", ceil(tiled / 4), "bag", "tile adhesive 20kg"),
          mat("Tile grout 5kg", ceil(tiled / 10), "bag", "tile grout 5kg"),
          mat("Waterproofing membrane 5L", ceil(tiled / 20), "tub", "waterproofing membrane 5l"),
          mat("Close-coupled toilet suite", 1, "each", "close coupled toilet suite"),
          mat("Basin & pedestal", 1, "each", "basin and pedestal"),
          mat("Shower mixer & rose", 1, "each", "shower mixer set"),
          labour("Strip-out, plumbing & tiling labour", ceil(tiled * 0.8)),
        ],
      };
    },
  },
];

export function getTemplate(id: string): JobTemplate | undefined {
  return JOB_TEMPLATES.find((t) => t.id === id);
}

/** Expand a template + measurements into a structured scope for pricing. */
export function scopeFromTemplate(
  template: JobTemplate,
  values: Record<string, number>,
): ExtractedScope {
  const built = template.build(values);
  return {
    jobTitle: built.jobTitle,
    summary: built.summary,
    assumptions: built.assumptions,
    lineItems: built.lineItems,
  };
}
