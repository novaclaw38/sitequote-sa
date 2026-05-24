import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { getDb, hasDatabase, schema } from "@/lib/db";
import { fileStore } from "@/lib/db/file-store";

export type PriceListItem = {
  id: string;
  contractorId: string;
  description: string;
  unit: string;
  unitPriceZar: number;
  searchQuery: string | null;
  createdAt: string;
};

export async function listPriceListItems(
  contractorId: string,
): Promise<PriceListItem[]> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.priceListItems)
      .where(eq(schema.priceListItems.contractorId, contractorId));
    return rows.map((r) => ({
      id: r.id,
      contractorId: r.contractorId,
      description: r.description,
      unit: r.unit,
      unitPriceZar: r.unitPriceZar,
      searchQuery: r.searchQuery,
      createdAt: r.createdAt.toISOString(),
    }));
  }
  return fileStore.listPriceListItems(contractorId);
}

export async function addPriceListItem(
  contractorId: string,
  input: {
    description: string;
    unit: string;
    unitPriceZar: number;
    searchQuery?: string;
  },
): Promise<PriceListItem> {
  const item: PriceListItem = {
    id: uuidv4(),
    contractorId,
    description: input.description,
    unit: input.unit,
    unitPriceZar: input.unitPriceZar,
    searchQuery: input.searchQuery ?? null,
    createdAt: new Date().toISOString(),
  };

  if (hasDatabase()) {
    const db = getDb();
    await db.insert(schema.priceListItems).values({
      id: item.id,
      contractorId: item.contractorId,
      description: item.description,
      unit: item.unit,
      unitPriceZar: item.unitPriceZar,
      searchQuery: item.searchQuery,
    });
  } else {
    await fileStore.addPriceListItem(item);
  }

  return item;
}

export async function deletePriceListItem(
  id: string,
  contractorId: string,
): Promise<boolean> {
  if (hasDatabase()) {
    const db = getDb();
    const result = await db
      .delete(schema.priceListItems)
      .where(
        and(
          eq(schema.priceListItems.id, id),
          eq(schema.priceListItems.contractorId, contractorId),
        ),
      );
    return Boolean(result);
  }
  return fileStore.deletePriceListItem(id, contractorId);
}

/** Match contractor price list by description or search query */
export async function findPriceListMatch(
  contractorId: string,
  query: string,
): Promise<PriceListItem | null> {
  const items = await listPriceListItems(contractorId);
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const scored = items
    .map((item) => {
      const desc = item.description.toLowerCase();
      const sq = (item.searchQuery ?? "").toLowerCase();
      let score = 0;
      if (desc === q || sq === q) score = 100;
      else if (desc.includes(q) || q.includes(desc)) score = 80;
      else if (sq && (sq.includes(q) || q.includes(sq))) score = 70;
      else {
        const words = q.split(/\s+/).filter((w) => w.length > 2);
        const hits = words.filter(
          (w) => desc.includes(w) || sq.includes(w),
        ).length;
        score = hits > 0 ? hits * 15 : 0;
      }
      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.item ?? null;
}
