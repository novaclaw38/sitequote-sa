import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deletePriceListItem } from "@/lib/price-list";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deletePriceListItem(id, session.contractorId);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
