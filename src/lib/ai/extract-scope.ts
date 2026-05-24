import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { extractedScopeSchema } from "@/lib/quote-schema";

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
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const { object } = await generateObject({
    model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
    schema: extractedScopeSchema,
    system: SYSTEM,
    prompt: `Transcript from contractor site note:\n\n${transcript}`,
  });

  return object;
}
