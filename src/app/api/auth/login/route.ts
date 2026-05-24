import { NextResponse } from "next/server";
import { z } from "zod";
import { loginContractor } from "@/lib/contractors";
import { createSession } from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    const contractor = await loginContractor(body.email, body.password);
    await createSession({
      contractorId: contractor.id,
      email: contractor.email,
    });
    return NextResponse.json({ contractor });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
