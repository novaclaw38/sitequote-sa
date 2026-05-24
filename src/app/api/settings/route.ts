import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { updateContractorSettings } from "@/lib/contractors";

const patchSchema = z.object({
  companyName: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  labourRateZar: z.number().positive().optional(),
  markupPercent: z.number().nonnegative().optional(),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = patchSchema.parse(await request.json());
    const contractor = await updateContractorSettings(
      session.contractorId,
      body,
    );
    return NextResponse.json({ contractor });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}
