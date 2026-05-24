import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getContractorById } from "@/lib/contractors";
import { sendQuoteEmail } from "@/lib/email/send-quote";
import { getQuote, updateQuote } from "@/lib/store";

const bodySchema = z.object({
  to: z.string().email(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.contractorId && quote.contractorId !== session.contractorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { to } = bodySchema.parse(await request.json());
    const contractor = await getContractorById(session.contractorId);

    await sendQuoteEmail({
      to,
      quote,
      companyName: contractor?.companyName,
    });

    const updated = await updateQuote(id, { status: "sent" });

    return NextResponse.json({ ok: true, quote: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
