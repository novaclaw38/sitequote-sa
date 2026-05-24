export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is required for transcription");
  }

  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType });
  
  const extension = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("mpeg")
      ? "mp3"
      : "webm";
      
  formData.append("file", blob, `audio.${extension}`);
  formData.append("model", "whisper-large-v3");
  formData.append("language", "en");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcription failed: ${err}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text.trim();
}
