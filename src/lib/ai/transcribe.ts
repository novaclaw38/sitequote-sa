export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for transcription");
  }

  const base64 = Buffer.from(audioBuffer).toString("base64");

  const format = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("mpeg")
      ? "mp3"
      : "webm";

  const res = await fetch(
    "https://openrouter.ai/api/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/whisper-large-v3",
        input_audio: {
          data: base64,
          format,
        },
        language: "en",
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcription failed: ${err}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text.trim();
}
