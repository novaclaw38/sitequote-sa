import { NextResponse } from "next/server";
import { getQuoteByShareToken } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const quote = await getQuoteByShareToken(token);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  const { transcript, ...publicQuote } = quote;
  return NextResponse.json({
    quote: {
      ...publicQuote,
      transcript: undefined,
    },
  });
}
