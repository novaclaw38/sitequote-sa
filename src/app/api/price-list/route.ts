import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import {
  addPriceListItem,
  listPriceListItems,
} from "@/lib/price-list";

const createSchema = z.object({
  description: z.string().min(2),
  unit: z.string().min(1),
  unitPriceZar: z.number().positive(),
  searchQuery: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const items = await listPriceListItems(session.contractorId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await request.json());
    const item = await addPriceListItem(session.contractorId, body);
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid data" },
      { status: 400 },
    );
  }
}
