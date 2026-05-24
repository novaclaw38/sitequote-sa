import { NextResponse } from "next/server";
import { getConfigStatus } from "@/lib/config-status";

export async function GET() {
  const status = getConfigStatus();
  return NextResponse.json({
    ok: status.ready,
    ...status,
  });
}
