import { NextResponse } from "next/server";
import {
  buildQuoteFromScope,
  buildQuoteFromTranscript,
} from "@/lib/ai/build-quote";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { getTemplate, scopeFromTemplate } from "@/lib/templates";
import { saveQuote, listQuotes } from "@/lib/store";
import { getSession } from "@/lib/auth/session";
import { getContractorById } from "@/lib/contractors";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  const session = await getSession();
  const quotes = await listQuotes(session?.contractorId ?? undefined);
  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let labourRateZar: number | undefined;
    let markupPercent: number | undefined;

    if (session) {
      const contractor = await getContractorById(session.contractorId);
      if (contractor) {
        labourRateZar = contractor.labourRateZar;
        markupPercent = contractor.markupPercent;
      }
    }

    const contentType = request.headers.get("content-type") ?? "";
    let transcript: string | undefined;
    let mediaUrl: string | undefined;
    let mediaType: "audio" | "video" | undefined;
    let templateId: string | undefined;
    let templateInputs: Record<string, number> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audio = formData.get("audio");
      const video = formData.get("video");
      const transcriptField = formData.get("transcript");

      if (typeof transcriptField === "string" && transcriptField.trim()) {
        transcript = transcriptField.trim();
      }

      const labourField = formData.get("labourRateZar");
      if (typeof labourField === "string" && labourField) {
        labourRateZar = parseFloat(labourField);
      }

      const markupField = formData.get("markupPercent");
      if (typeof markupField === "string" && markupField) {
        markupPercent = parseFloat(markupField);
      }

      mediaUrl =
        typeof formData.get("mediaUrl") === "string"
          ? (formData.get("mediaUrl") as string)
          : undefined;

      const media = audio ?? video;
      if (media instanceof Blob && media.size > 0) {
        const buffer = await media.arrayBuffer();
        const mime = media.type || "audio/webm";
        transcript = await transcribeAudio(buffer, mime);
        mediaType = video ? "video" : "audio";
      }
    } else {
      const body = (await request.json()) as {
        transcript?: string;
        mediaUrl?: string;
        mediaType?: "audio" | "video";
        labourRateZar?: number;
        markupPercent?: number;
        templateId?: string;
        inputs?: Record<string, number>;
      };
      transcript = body.transcript?.trim();
      mediaUrl = body.mediaUrl;
      mediaType = body.mediaType;
      templateId = body.templateId;
      if (body.inputs) templateInputs = body.inputs;
      if (body.labourRateZar != null) labourRateZar = body.labourRateZar;
      if (body.markupPercent != null) markupPercent = body.markupPercent;
    }

    // Job-template path: deterministic scope from a picked job + measurements.
    if (templateId) {
      const template = getTemplate(templateId);
      if (!template) {
        return NextResponse.json(
          { error: "Unknown job template" },
          { status: 400 },
        );
      }
      const scope = scopeFromTemplate(template, templateInputs);
      const quote = await buildQuoteFromScope({
        scope,
        labourRateZar,
        markupPercent,
        contractorId: session?.contractorId ?? null,
      });
      const stored = await saveQuote(quote, session?.contractorId ?? null);
      return NextResponse.json({ quote: stored });
    }

    if (!transcript) {
      return NextResponse.json(
        {
          error:
            "Provide a voice note, video, or transcript text to generate a quote",
        },
        { status: 400 },
      );
    }

    const quote = await buildQuoteFromTranscript({
      transcript,
      mediaUrl,
      mediaType,
      labourRateZar,
      markupPercent,
      contractorId: session?.contractorId ?? null,
    });

    const stored = await saveQuote(quote, session?.contractorId ?? null);

    return NextResponse.json({ quote: stored });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to generate quote",
      },
      { status: 500 },
    );
  }
}
