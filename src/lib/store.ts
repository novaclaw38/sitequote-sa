import { v4 as uuidv4 } from "uuid";
import { eq, desc, isNull } from "drizzle-orm";
import { getDb, hasDatabase, schema } from "@/lib/db";
import { fileStore } from "@/lib/db/file-store";
import type { Quote } from "@/lib/quote-schema";
import { quoteSchema } from "@/lib/quote-schema";

export type StoredQuote = Quote & {
  shareToken: string;
  contractorId: string | null;
};

function rowToQuote(row: {
  id: string;
  contractorId: string | null;
  shareToken: string;
  data: unknown;
  status: string;
}): StoredQuote {
  const data = quoteSchema.parse(row.data);
  return {
    ...data,
    id: row.id,
    status: row.status as Quote["status"],
    shareToken: row.shareToken,
    contractorId: row.contractorId,
  };
}

export async function saveQuote(
  quote: Quote,
  contractorId?: string | null,
): Promise<StoredQuote> {
  const shareToken = uuidv4().replace(/-/g, "").slice(0, 16);
  const now = new Date();

  if (hasDatabase()) {
    const db = getDb();
    await db.insert(schema.quotes).values({
      id: quote.id,
      contractorId: contractorId ?? null,
      shareToken,
      data: quote,
      status: quote.status,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await fileStore.saveQuote({
      id: quote.id,
      contractorId: contractorId ?? null,
      shareToken,
      data: quote,
      status: quote.status,
      createdAt: quote.createdAt,
      updatedAt: now.toISOString(),
    });
  }

  return { ...quote, shareToken, contractorId: contractorId ?? null };
}

export async function getQuote(id: string): Promise<StoredQuote | undefined> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.id, id))
      .limit(1);
    return rows[0] ? rowToQuote(rows[0]) : undefined;
  }
  const row = await fileStore.getQuote(id);
  return row ? rowToQuote(row) : undefined;
}

export async function getQuoteByShareToken(
  token: string,
): Promise<StoredQuote | undefined> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.shareToken, token))
      .limit(1);
    return rows[0] ? rowToQuote(rows[0]) : undefined;
  }
  const row = await fileStore.getQuoteByShareToken(token);
  return row ? rowToQuote(row) : undefined;
}

export async function listQuotes(
  contractorId?: string | null,
): Promise<StoredQuote[]> {
  if (hasDatabase()) {
    const db = getDb();
    const rows = contractorId
      ? await db
          .select()
          .from(schema.quotes)
          .where(eq(schema.quotes.contractorId, contractorId))
          .orderBy(desc(schema.quotes.createdAt))
      : await db
          .select()
          .from(schema.quotes)
          .where(isNull(schema.quotes.contractorId))
          .orderBy(desc(schema.quotes.createdAt));
    return rows.map(rowToQuote);
  }
  const rows = await fileStore.listQuotes(contractorId);
  return rows.map(rowToQuote);
}

export async function updateQuote(
  id: string,
  patch: Partial<Quote>,
): Promise<StoredQuote | undefined> {
  const existing = await getQuote(id);
  if (!existing) return undefined;

  const { shareToken, contractorId, ...quoteFields } = existing;
  const updated: Quote = { ...quoteFields, ...patch, id };
  const now = new Date();

  if (hasDatabase()) {
    const db = getDb();
    await db
      .update(schema.quotes)
      .set({
        data: updated,
        status: updated.status,
        updatedAt: now,
      })
      .where(eq(schema.quotes.id, id));
  } else {
    await fileStore.saveQuote({
      id,
      contractorId,
      shareToken,
      data: updated,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: now.toISOString(),
    });
  }

  return { ...updated, shareToken, contractorId };
}
