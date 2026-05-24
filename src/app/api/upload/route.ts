import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename =
      file instanceof File && file.name
        ? file.name
        : `recording-${Date.now()}.webm`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "BLOB_READ_WRITE_TOKEN not configured",
          hint: "For local dev, quotes can still be generated from audio sent directly to /api/quotes",
        },
        { status: 503 },
      );
    }

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      contentType: file.type,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 },
    );
  }
}
