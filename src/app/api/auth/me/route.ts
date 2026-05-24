import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getContractorById } from "@/lib/contractors";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ contractor: null });
  }
  const contractor = await getContractorById(session.contractorId);
  return NextResponse.json({ contractor });
}
