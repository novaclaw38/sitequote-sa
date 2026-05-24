import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuoteByShareToken, updateQuote } from "@/lib/store";

const bodySchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const quote = await getQuoteByShareToken(token);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    const { status } = bodySchema.parse(await request.json());
    const updated = await updateQuote(quote.id, { status });
    return NextResponse.json({ quote: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid request" },
      { status: 400 },
    );
  }
}
