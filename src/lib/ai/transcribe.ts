export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for transcription");
  }

  const ext = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("mpeg")
      ? "mp3"
      : "webm";

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: mimeType.split(";")[0] || "audio/webm" }),
    `recording.${ext}`,
  );
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcription failed: ${err}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text.trim();
}
