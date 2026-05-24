import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addPriceListItem } from "@/lib/price-list";

type CsvRow = {
  description: string;
  unit: string;
  unitPriceZar: number;
  searchQuery?: string;
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("description") || header.includes("price");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: CsvRow[] = [];

  for (const line of dataLines) {
    const parts = parseCsvLine(line).map((p) => p.replace(/^"|"$/g, "").trim());
    if (parts.length < 3) continue;
    const [description, unit, price, searchQuery] = parts;
    const unitPriceZar = parseFloat(price);
    if (!description || Number.isNaN(unitPriceZar)) continue;
    rows.push({
      description,
      unit: unit || "each",
      unitPriceZar,
      searchQuery: searchQuery || undefined,
    });
  }
  return rows;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No CSV file" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows. Format: description, unit, price, keywords" },
      { status: 400 },
    );
  }

  const items = [];
  for (const row of rows) {
    items.push(await addPriceListItem(session.contractorId, row));
  }

  return NextResponse.json({ imported: items.length, items });
}
