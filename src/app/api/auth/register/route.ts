import { NextResponse } from "next/server";
import { z } from "zod";
import { registerContractor } from "@/lib/contractors";
import { createSession } from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    const contractor = await registerContractor(body);
    await createSession({
      contractorId: contractor.id,
      email: contractor.email,
    });
    return NextResponse.json({ contractor });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
