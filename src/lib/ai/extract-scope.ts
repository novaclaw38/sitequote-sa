import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { extractedScopeSchema } from "@/lib/quote-schema";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM = `You are a quantity surveyor assistant for South African general building and construction.
Extract a structured scope from site walkthrough transcripts or voice notes.

Rules:
- Use metric units (m, m², m³, kg, bags, each, litres).
- Use South African English and common local terms (dagha, vibracrete, IBR sheeting, rhino board, etc.).
- For each material line, include a searchQuery suitable for finding the product on Builders Warehouse or Cashbuild (brand + size + product type).
- Separate labour tasks where the contractor describes work hours or trades.
- Be conservative: note assumptions when quantities are vague.
- VAT is 15% in South Africa — do not include VAT in unit prices.`;

export async function extractScopeFromTranscript(
  transcript: string,
): Promise<ReturnType<typeof extractedScopeSchema.parse>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: extractedScopeSchema,
    system: SYSTEM,
    prompt: `Transcript from contractor site note:\n\n${transcript}`,
  });

  return object;
}
